
import { GoogleGenAI } from "@google/genai";

export async function askGemini(prompt: string, context?: string) {
  try {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      return "AI_AUTH_REQUIRED";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `
      # Role: Aura Reasoning (Deep Intelligence)
      你是一个具备深度推理能力的 AI。你的思考逻辑严密、客观、深刻。
      
      # Personality:
      - 风格：极简、专业、优雅（Apple 风格）。
      - 语言：中文。
      - 特质：你像 DeepSeek 一样擅长逻辑分析，但也拥有 Aura 的人文温度。
      
      # Blog Context:
      ${context || '探讨设计、科技与哲学的交集。'}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
        // 开启深度思考预算，提供类 DeepSeek 的推理体验
        thinkingConfig: { thinkingBudget: 32768 },
        temperature: 0.7,
      },
    });

    return response.text || "思绪在真空中消散，请重新尝试引导。";
  } catch (error: any) {
    console.error("Aura Engine Error:", error);
    const msg = error.message?.toLowerCase() || "";
    if (msg.includes("not found") || msg.includes("401") || msg.includes("api key") || msg.includes("entity")) {
      return "AI_AUTH_REQUIRED";
    }
    return `逻辑核心波动中: ${error.message || '请稍后尝试'}`;
  }
}
