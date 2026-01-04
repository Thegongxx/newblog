
import { GoogleGenAI } from "@google/genai";

export async function askGemini(prompt: string, context?: string) {
  try {
    // 检查环境变量是否存在
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      console.error("API_KEY is not defined in the environment.");
      return "Assistant setup incomplete: API Key is missing. Please check your Vercel Environment Variables and ensure the key name is exactly 'API_KEY'.";
    }

    // 将初始化移入 try 块，捕获可能的构造函数错误
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `You are a sophisticated AI assistant for a minimalist design blog called 'Aura'. 
    Your tone is calm, insightful, and precise. You help readers understand the nuances of the blog posts. 
    Current context of the blog: ${context || 'A personal blog about design, technology and philosophy.'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I'm having trouble thinking right now. Let's try again in a moment.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // 处理特定错误，例如模型不存在或权限问题
    if (error.message?.includes("not found")) {
      return "The requested AI model is currently unavailable in your region or for this API key.";
    }
    
    return `Connection error: ${error.message || "The stars are misaligned."}`;
  }
}
