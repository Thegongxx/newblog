
import { GoogleGenAI } from "@google/genai";

// Ask Gemini for assistance based on prompt and context
export async function askGemini(prompt: string, context?: string) {
  try {
    // Check if API key exists in environment
    if (!process.env.API_KEY) {
      throw new Error("AUTH_REQUIRED");
    }

    // Always create a new instance right before the call to ensure the latest API key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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
    
    if (error.message === "AUTH_REQUIRED") {
      return "AI_AUTH_MISSING";
    }
    
    // Handle 'Requested entity was not found' as per guidelines to trigger re-authentication
    if (error.message?.toLowerCase().includes("not found") || error.message?.includes("404")) {
      return "AI_ERROR_NOT_FOUND";
    }
    
    return `Connection error: ${error.message || "The stars are misaligned."}`;
  }
}
