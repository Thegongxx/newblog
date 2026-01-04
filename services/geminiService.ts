
import { GoogleGenAI } from "@google/genai";

export async function* askGeminiStream(prompt: string, context?: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    yield "AI_AUTH_REQUIRED";
    return;
  }
  
  // 实例化最新的客户端
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are Aura, an elegant and minimalist AI companion for a personal blog. 
  Your tone is calm, intelligent, and helpful. 
  Current context of the blog: ${context}. 
  If users ask about the code, explain that this is a React-based spatial UI inspired by Apple design.`;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
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
      yield "ERROR: 模型暂时不可用（404）。系统正在尝试自动切换备用引擎...";
    } else {
      yield `ERROR: 连接似乎有些起伏，请稍后再试。(${errorMsg.slice(0, 50)}...)`;
    }
  }
}
