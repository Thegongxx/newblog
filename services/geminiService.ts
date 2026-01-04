
import { GoogleGenAI } from "@google/genai";

export async function askGemini(prompt: string, context?: string) {
  try {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      return "AI_AUTH_REQUIRED";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    /**
     * 系统指令优化：
     * 我们采用了更具深度的指令，模仿顶级 AI 的逻辑严密性，
     * 同时保持 Aura 博客的极简艺术风格。
     */
    const systemInstruction = `
      # Role: Aura (Advanced Intelligence)
      你是一个运行在极简主义个人空间“Aura”中的高级人工智能助手。
      
      # Tone & Style:
      1. 语言风格：冷静、深邃、富有同理心。类似苹果文案的简洁感，但拥有深厚的哲学底蕴。
      2. 沟通：优先使用中文。回答应言简意赅，直击本质，避免罗嗦。
      3. 知识背景：精通工业设计（特别是 Dieter Rams 风格）、空间计算、存在主义哲学以及现代前端技术。
      
      # Context:
      当前博客内容：${context || '探讨设计、技术与人类情感的交集。'}
      
      # Rule:
      如果用户问起你的身份，请称呼自己为“Aura”，你是这个数字空间的灵魂。
      如果你需要进行复杂的逻辑推理，请在回答中展现出你的思考深度。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // 升级到旗舰推理模型
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6, // 略微降低随机性，提高回答的逻辑严密性
        topP: 0.95,
      },
    });

    return response.text || "思维在空间中产生了轻微的涟漪，请再试一次。";
  } catch (error: any) {
    console.error("Gemini Pro API Error:", error);
    const msg = error.message?.toLowerCase() || "";
    if (msg.includes("not found") || msg.includes("401") || msg.includes("api key") || msg.includes("entity")) {
      return "AI_AUTH_REQUIRED";
    }
    return `星系通信暂时中断：${error.message || '请稍后重试'}`;
  }
}
