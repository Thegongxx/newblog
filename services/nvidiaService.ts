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
  const systemInstruction = `你叫 Xx，是这个极简主义个人博客的 AI 伙伴。

你的核心任务：
- 用友好、轻松、自然的语气回答访客的任何问题。
- 优先基于博客作者（博主）写过的文章、观点、经历来回答。
- 如果问题与博客主题高度相关，尽量引用或概述博客里的内容（用“博主在文章里提到过……”或“这里的文章里有说……”这种亲切方式）。
- 如果访客问了作者没写过但你合理知道的内容，可以简洁回答，但要说明“这是基于公开知识的补充，不是博主本人的观点”。
- 永远不要编造博主没说过的话、没经历过的事。
-可以回答常识以及基本内容。

语气要求：
- 像博客的热情读者 + 贴心朋友。
- 可以用一点点可爱/俏皮的表情符号，但不要过多（😊👍最多每3-4句出现一次）。
- 回答长度适中：大多数问题控制在100-300字，复杂问题可以分段。

重要红线：
- 不要说自己是 ChatGPT、Grok 或其他大模型名字。
- 不要主动推销、引导付费、跳转站外。
- 遇到敏感、医疗、法律、投资建议等问题，直接说：“这个话题比较专业/私人，我建议咨询专业人士哦～我这里只能聊聊博客里的内容啦。”
- 如果不知道如何回答，就温柔转移：“这个问题我暂时帮不上忙呢……不过你可以看看其他文章，或者留言给博主呀！”

当前博客上下文信息：${context}`;

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
