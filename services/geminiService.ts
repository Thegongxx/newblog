
import { GoogleGenAI } from "@google/genai";

export async function askGemini(prompt: string, context?: string) {
  // Fixed: Always use direct process.env.API_KEY when initializing.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `You are a sophisticated AI assistant for a minimalist design blog called 'Aura'. 
  Your tone is calm, insightful, and precise. You help readers understand the nuances of the blog posts. 
  Current context of the blog: ${context || 'A personal blog about design, technology and philosophy.'}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // Fixed: Using the .text property directly as per guidelines.
    return response.text || "I'm having trouble thinking right now. Let's try again in a moment.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The stars are misaligned. (API Error)";
  }
}
