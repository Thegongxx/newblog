
import { type Comment } from '../types';

/**
 * 使用 NVIDIA NIM (OpenAI 兼容接口) 调用 Qwen 模型
 * 采用原生 fetch 实现以减少外部依赖
 */
export async function* askNvidiaStream(prompt: string, context?: string) {
    const systemInstruction = `You are Aura, an elegant and minimalist AI companion for a personal blog. 
  Your tone is calm, intelligent, and helpful. 
  Current context of the blog: ${context}. 
  If users ask about the code, explain that this is a React-based spatial UI inspired by Apple design.`;

    try {
        // 调用我们自己的 Vercel Serverless 后端，解决 CORS 并保护 API Key
        const response = await fetch("/api/ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt,
                systemInstruction
            })
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
            // 解析流式数据
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
