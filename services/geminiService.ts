
import { GoogleGenAI } from "@google/genai";

// 文本流接口：用于博客问答与闲聊
export async function* askGeminiStream(prompt: string, context?: string) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    yield "AI_AUTH_REQUIRED";
    return;
  }
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `你叫 Aura，是一个温和、睿智、善于倾听的博客伴侣。语调优雅、真诚。你当前所在的博客内容上下文：${context}`;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: { 
        systemInstruction, 
        temperature: 0.7,
        topP: 0.95,
      },
    });
    
    for await (const chunk of response) {
      if (chunk.text) yield chunk.text;
    }
  } catch (error: any) {
    console.error("Gemini Stream Error:", error);
    yield `ERROR:连接似乎有些起伏，请稍后再试。`;
  }
}
