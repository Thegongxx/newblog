
import { GoogleGenAI } from "@google/genai";

// Use process.env.API_KEY for the API key as per the @google/genai coding guidelines.
export async function* askGeminiStream(prompt: string, context?: string) {
  // 在 Vite 中，客户端环境变量需要以 VITE_ 开头，并通过 import.meta.env 访问
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    yield "AI_AUTH_REQUIRED";
    return;
  }

  // 初始化 Gemini 客户端
  const ai = new GoogleGenAI(apiKey);

  const systemInstruction = `You are Aura, an elegant and minimalist AI companion for a personal blog. 
  Your tone is calm, intelligent, and helpful. 
  Current context of the blog: ${context}. 
  If users ask about the code, explain that this is a React-based spatial UI inspired by Apple design.`;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    for await (const chunk of response) {
      if (chunk.text) yield chunk.text;
    }
  } catch (error: any) {
    console.error("Gemini Stream Error:", error);
    const errorMsg = error.message || "";

    if (errorMsg.includes("404")) {
      yield "ERROR: 模型暂时不可用。请确保 API Key 已启用 Gemini 1.5 权限。";
    } else {
      yield `ERROR: 连接似乎有些起伏。(${errorMsg.slice(0, 50)}...)`;
    }
  }
}
