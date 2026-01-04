
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ICONS, BLOG_POSTS } from '../constants';
import { askGeminiStream, connectAuraLive, decode, decodeAudioData, encode } from '../services/geminiService';
import { Message } from '../types';

const Assistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live Audio Refs
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const [transcription, setTranscription] = useState({ user: '', aura: '' });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading, isLive, transcription]);

  const initAudioContexts = () => {
    if (!outputAudioContextRef.current) {
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (!inputAudioContextRef.current) {
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
    [outputAudioContextRef, inputAudioContextRef].forEach(ref => {
      if (ref.current?.state === 'suspended') ref.current.resume();
    });
  };

  const stopLive = () => {
    setIsLive(false);
    setIsSpeaking(false);
    setTranscription({ user: '', aura: '' });
    
    sessionPromiseRef.current?.then(session => session.close());
    sessionPromiseRef.current = null;

    micStreamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current = null;

    activeSourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    activeSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const startLive = async () => {
    try {
      initAudioContexts();
      setIsLive(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      sessionPromiseRef.current = connectAuraLive({
        onAudioChunk: async (base64) => {
          const ctx = outputAudioContextRef.current!;
          setIsSpeaking(true);
          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
          
          const buffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(nextStartTimeRef.current);
          nextStartTimeRef.current += buffer.duration;
          
          activeSourcesRef.current.add(source);
          source.onended = () => {
            activeSourcesRef.current.delete(source);
            if (activeSourcesRef.current.size === 0) setIsSpeaking(false);
          };
        },
        onInterrupted: () => {
          activeSourcesRef.current.forEach(s => {
            try { s.stop(); } catch(e) {}
          });
          activeSourcesRef.current.clear();
          nextStartTimeRef.current = 0;
          setIsSpeaking(false);
        },
        onTranscription: (text, isUser) => {
          setTranscription(prev => ({
            ...prev,
            [isUser ? 'user' : 'aura']: text
          }));
        },
        onError: (e) => {
          console.error("Live Error:", e);
          stopLive();
        },
        onClose: () => stopLive(),
      });

      const session = await sessionPromiseRef.current;

      // 发送麦克风数据
      const inputCtx = inputAudioContextRef.current!;
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const l = inputData.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
          int16[i] = inputData[i] * 32768;
        }
        const pcmBase64 = encode(new Uint8Array(int16.buffer));
        
        sessionPromiseRef.current?.then(s => {
          s.sendRealtimeInput({
            media: { data: pcmBase64, mimeType: 'audio/pcm;rate=16000' }
          });
        });
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);

    } catch (err: any) {
      console.error("Failed to start live:", err);
      stopLive();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const stream = askGeminiStream(currentInput, `文章标题列表: ${BLOG_POSTS.map(p => p.title).join(', ')}`);
      let full = '';
      for await (const chunk of stream) {
        full += chunk;
        setMessages(prev => {
          const last = [...prev];
          last[last.length - 1].content = full;
          return last;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-[100] flex items-center justify-center h-14 transition-all duration-700 bg-white text-black hover:scale-110 active:scale-95 shadow-[0_20px_60px_-10px_rgba(255,255,255,0.3)] ${isOpen ? 'w-14 rounded-full rotate-90' : 'px-8 rounded-2xl'}`}
      >
        {isOpen ? (
          <span className="text-2xl font-light">×</span>
        ) : (
          <div className="flex items-center gap-3">
            <div className="relative">
              {ICONS.AI}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
            </div>
            <span className="font-bold tracking-tight text-sm">Aura</span>
          </div>
        )}
      </button>

      {/* Main Panel */}
      <div 
        className={`fixed bottom-28 right-8 z-[90] w-[calc(100vw-4rem)] md:w-[480px] max-h-[85vh] bg-[#080808]/90 backdrop-blur-[50px] border border-white/10 rounded-[4rem] flex flex-col overflow-hidden transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) shadow-[0_80px_160px_-40px_rgba(0,0,0,0.8)] origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-20 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${isLive ? 'bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-pulse' : 'bg-white/10'}`} />
            <div>
              <h3 className="text-white text-sm font-bold tracking-tight">Aura</h3>
              <p className="text-white/30 text-[9px] uppercase tracking-[0.3em] font-medium">
                {isLive ? 'Real-time Native Audio' : 'Companion Interface'}
              </p>
            </div>
          </div>
          <button 
            onClick={isLive ? stopLive : startLive}
            className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-full border transition-all duration-500 text-[10px] uppercase tracking-widest font-extrabold ${
              isLive 
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-blue-400' : 'bg-white/20 group-hover:bg-white'}`} />
            {isLive ? 'End Session' : 'Start Voice'}
          </button>
        </div>

        {/* Content View */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {isLive ? (
            <div className="h-full flex flex-col items-center justify-center space-y-16 animate-in fade-in zoom-in-95 duration-1000">
              {/* Siri-style Visualizer */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Background Glows */}
                <div className={`absolute inset-0 rounded-full transition-all duration-[2000ms] ${isSpeaking ? 'bg-blue-600/10 blur-3xl scale-125' : 'bg-white/5 blur-2xl scale-100'}`} />
                
                {/* Dynamic Rings */}
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`absolute inset-0 border border-white/5 rounded-full animate-ping-slow`} 
                    style={{ animationDelay: `${i * 1.5}s` }} 
                  />
                ))}

                {/* Core Sphere */}
                <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl ${isSpeaking ? 'bg-blue-500 scale-110' : 'bg-white'}`}>
                  <div className="flex items-end gap-1.5 h-8">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1 rounded-full transition-all duration-300 ${isSpeaking ? 'bg-white' : 'bg-black opacity-30'}`}
                        style={{ 
                          height: isSpeaking ? `${20 + Math.random() * 40}px` : '4px',
                          animation: isSpeaking ? `aura-wave 1s ease-in-out infinite alternate` : 'none',
                          animationDelay: `${i * 150}ms`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Transcription Overlay */}
              <div className="w-full text-center space-y-6 px-6">
                <div className="space-y-2">
                  <p className="text-white/20 text-[10px] uppercase tracking-widest font-black">Hearing...</p>
                  <p className="text-white text-lg font-light tracking-tight leading-relaxed italic min-h-[3.5rem]">
                    {transcription.user || "随便说点什么，我在听..."}
                  </p>
                </div>
                {transcription.aura && (
                  <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-700">
                    <p className="text-blue-500/40 text-[10px] uppercase tracking-widest font-black">Aura:</p>
                    <p className="text-white/70 text-base font-light tracking-wide leading-relaxed">
                      {transcription.aura}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in duration-1000">
                  <div className="w-20 h-20 mb-12 rounded-[2rem] bg-white/5 flex items-center justify-center text-white/10 scale-150 rotate-6 border border-white/5">
                    {ICONS.AI}
                  </div>
                  <h4 className="text-white/80 text-xl font-bold tracking-tighter mb-4">开启一段对话</h4>
                  <p className="text-white/20 text-[13px] font-light tracking-wide leading-relaxed max-w-[240px]">
                    您可以询问关于本博客的任何内容，或者点击上方开启语音模式体验 Native Audio 的惊喜。
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-700`}>
                  <div className={`max-w-[88%] px-8 py-6 rounded-[2.5rem] text-[15px] leading-[1.8] tracking-wide ${
                    m.role === 'user' 
                      ? 'bg-white text-black font-semibold rounded-tr-none shadow-xl' 
                      : 'text-white/90 rounded-tl-none bg-white/[0.04] border border-white/5'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && !messages[messages.length-1].content && (
                <div className="flex justify-start items-center gap-3">
                   <div className="flex gap-1.5 p-4 rounded-full bg-white/5">
                     <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                     <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:200ms]" />
                     <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:400ms]" />
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Bar */}
        {!isLive && (
          <div className="p-10 pt-4">
            <div className="relative group">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="在此分享你的想法..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-[2.5rem] px-8 py-5 text-[15px] text-white placeholder-white/10 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all duration-500"
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-3 top-3 w-11 h-11 rounded-full bg-white text-black flex items-center justify-center opacity-0 translate-x-4 group-focus-within:opacity-100 group-focus-within:translate-x-0 transition-all duration-500 disabled:opacity-0"
              >
                {ICONS.CHEVRON_RIGHT}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes aura-wave {
          from { height: 10px; transform: scaleY(0.5); }
          to { height: 40px; transform: scaleY(1.2); }
        }
        @keyframes animate-ping-slow {
          0% { transform: scale(0.8); opacity: 0; }
          50% { opacity: 0.1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(255,255,255,0.05); 
          border-radius: 10px;
        }
        .animate-ping-slow {
          animation: animate-ping-slow 4s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
};

export default Assistant;
