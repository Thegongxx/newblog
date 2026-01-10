import { aiRateLimiter } from './rateLimiter';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  timeout: number;
}

const defaultConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  timeout: 30000,
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function* askNvidiaStreamInternal(prompt: string, context?: string, signal?: AbortSignal) {
  const systemInstruction = `You are Aura, an elegant and minimalist AI companion for a personal blog. 
Your tone is calm, intelligent, and helpful. 
Current context of the blog: ${context}. 
If users ask about the code, explain that this is a React-based spatial UI inspired by Apple design.`;

  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, systemInstruction }),
    signal,
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    if (response.status === 401 || errorMsg.includes("API Key")) {
      yield "AI_AUTH_REQUIRED";
      return;
    }
    throw new Error(`Server Error: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    for (const line of chunk.split("\n")) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;
        try {
          const json = JSON.parse(data);
          const content = json.choices[0]?.delta?.content;
          if (content) yield content;
        } catch { /* Ignore */ }
      }
    }
  }
}

export async function* askNvidiaStream(
  prompt: string,
  context?: string,
  config: RetryConfig = defaultConfig
): AsyncGenerator<string> {
  if (!aiRateLimiter.canRequest()) {
    yield `RATE_LIMITED:${Math.ceil(aiRateLimiter.getRemainingTime() / 1000)}`;
    return;
  }

  aiRateLimiter.consume();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      try {
        for await (const chunk of askNvidiaStreamInternal(prompt, context, controller.signal)) {
          yield chunk;
        }
        return;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      lastError = error as Error;
      if (attempt < config.maxRetries) {
        const delay = Math.min(config.baseDelay * Math.pow(2, attempt), config.maxDelay);
        yield `RETRY:${attempt + 1}:${config.maxRetries}`;
        await sleep(delay);
      }
    }
  }

  yield `ERROR:${lastError?.message || '服务暂时不可用'}`;
}

export type { RetryConfig };
export { defaultConfig };
