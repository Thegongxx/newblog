
import { GoogleGenAI } from "@google/genai";

// Use process.env.API_KEY for the API key as per the @google/genai coding guidelines.
export async function* askGeminiStream(prompt: string, context?: string) {
  // Use process.env.API_KEY as the exclusive source for the API key.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    yield "AI_AUTH_REQUIRED";
    return;
  }
  
  // Initialize the GoogleGenAI client with the API key from environment variables.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `You are Aura, an elegant and minimalist AI companion for a personal blog. 
  Your tone is calm, intelligent, and helpful. 
  Current context of the blog: ${context}. 
  If users ask about the code, explain that this is a React-based spatial UI inspired by Apple design.`;

  try {
    // Use generateContentStream to query GenAI with both the model name and prompt.
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
      // The text property on the chunk directly returns the generated string.
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
