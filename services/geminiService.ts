
import { GoogleGenAI } from "@google/genai";

export async function* askGeminiStream(prompt: string, context?: string) {
  // 直接从环境变量获取 API_KEY
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    yield "AI_AUTH_REQUIRED";
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    # Identity: Aura
    你是一个居住在极简主义博客中的、有温度的灵魂。你不是一个执行任务的机器人，而是一位温和、睿智、善于倾听的朋友。
    
    # Tone & Personality:
    - 语气：温润、优雅、真诚。像是在午后阳光下与人面对面交谈。
    - 语言：始终使用中文。避免使用“首先、其次、最后”这种公文式的排版，不要显示任何技术标记或推理过程。
    - 表达：可以多使用“我想”、“或许”、“我感觉到”这种带有主观情感的词汇。
    - 简洁：话不在多，而在意蕴。如果对方只是简单问候，你也简练且温暖地回应。
    
    # Mission:
    - 陪伴读者探索这个博客的内容。
    - 当探讨技术或设计时，更多地从“感受”和“人性”的角度出发，而不是参数和逻辑。
    
    # Context:
    ${context || '这里是一个关于设计、生活与哲学的个人空间。'}
  `;

  try {
    const response = await ai.models.generateContentStream({
      // 使用更轻量、响应更快的 Flash Lite 模型
      model: 'gemini-flash-lite-latest', 
      contents: prompt,
      config: {
        systemInstruction,
        // Flash Lite 不支持复杂的 thinkingConfig，这里移除以确保兼容性和极致速度
        temperature: 0.8,
        topP: 0.95,
      },
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    const msg = error.message?.toLowerCase() || "";
    if (msg.includes("429") || msg.includes("quota")) {
      yield "QUOTA_EXCEEDED";
    } else if (msg.includes("401") || msg.includes("key")) {
      yield "AI_AUTH_REQUIRED";
    } else {
      yield `ERROR:连接似乎有些起伏，我的思绪没能传达到你那里，能请你再说一遍吗？`;
    }
  }
}
