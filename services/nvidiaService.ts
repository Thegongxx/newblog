
import { type Comment } from '../types';

/**
 * 使用 NVIDIA NIM (OpenAI 兼容接口) 调用 Qwen 模型
 * 采用原生 fetch 实现以减少外部依赖
 */
export async function* askNvidiaStream(prompt: string, context?: string) {
    const apiKey = import.meta.env.VITE_NVIDIA_API_KEY;
    if (!apiKey) {
        yield "AI_AUTH_REQUIRED";
        return;
    }

    const systemInstruction = `You are Aura, an elegant and minimalist AI companion for a personal blog. 
  Your tone is calm, intelligent, and helpful. 
  Current context: ${context}. 
  Explain things simply and elegantly.`;

    try {
        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "qwen/qwen2.5-72b-instruct", // 默认推荐的高质量模型，或使用用户指定的 qwen3-next-80b
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: prompt }
                ],
                temperature: 0.6,
                top_p: 0.7,
                max_tokens: 4096,
                stream: true
            })
        });

        if (!response.ok) {
            throw new Error(`NVIDIA API Error: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) return;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const data = line.slice(6).trim();
                    if (data === "[DONE]") return;
                    try {
                        const json = JSON.parse(data);
                        const content = json.choices[0]?.delta?.content;
                        if (content) yield content;
                    } catch (e) {
                        // 忽略非 JSON 行
                    }
                }
            }
        }
    } catch (error: any) {
        console.error("NVIDIA Stream Error:", error);
        yield `ERROR: 服务暂时无法连接 (${error.message.slice(0, 50)}...)`;
    }
}
