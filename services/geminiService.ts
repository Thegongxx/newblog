
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";

// 辅助函数：将 Uint8Array 编码为 Base64 字符串
export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// 辅助函数：将 Base64 字符串解码为 Uint8Array
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// 辅助函数：将原始 PCM 数据解码为 AudioBuffer
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// 文本流接口（用于兼容旧逻辑）
export async function* askGeminiStream(prompt: string, context?: string) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    yield "AI_AUTH_REQUIRED";
    return;
  }
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `你叫 Aura，是一个温和、睿智、善于倾听的博客伴侣。语调优雅、真诚。上下文：${context}`;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: { systemInstruction, temperature: 0.8 },
    });
    for await (const chunk of response) {
      if (chunk.text) yield chunk.text;
    }
  } catch (error: any) {
    yield `ERROR:连接似乎有些起伏。`;
  }
}

// 核心：实时语音连接接口
export async function connectAuraLive(callbacks: {
  onAudioChunk: (base64: string) => void;
  onInterrupted: () => void;
  onTranscription: (text: string, isUser: boolean) => void;
  onError: (err: any) => void;
  onClose: () => void;
}) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("AI_AUTH_REQUIRED");

  const ai = new GoogleGenAI({ apiKey });
  
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }, // 优雅温柔的声音
      },
      systemInstruction: '你叫 Aura。现在我们在进行实时语音对话。请保持回答简洁、自然、口语化，像一个老朋友在耳边低语。不要解释复杂逻辑，注重情感共鸣。如果我打断你，请立即停止。',
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    },
    callbacks: {
      onopen: () => console.log("Aura Live Connected"),
      onmessage: async (message: LiveServerMessage) => {
        // 处理语音输出
        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (audioData) {
          callbacks.onAudioChunk(audioData);
        }

        // 处理打断
        if (message.serverContent?.interrupted) {
          callbacks.onInterrupted();
        }

        // 处理实时转写
        if (message.serverContent?.inputTranscription) {
          callbacks.onTranscription(message.serverContent.inputTranscription.text, true);
        }
        if (message.serverContent?.outputTranscription) {
          callbacks.onTranscription(message.serverContent.outputTranscription.text, false);
        }
      },
      onerror: callbacks.onError,
      onclose: callbacks.onClose,
    },
  });
}
