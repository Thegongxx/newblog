
import React, { useState, useRef, useEffect } from 'react';
import { ICONS, BLOG_POSTS } from '../constants';
import { askNvidiaStream } from '../services/nvidiaService';
import { Message } from '../types';

const Assistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }]);

    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const context = `文章标题列表: ${BLOG_POSTS.map(p => p.title).join(', ')}`;
      const stream = askNvidiaStream(currentInput, context);

      let fullContent = '';
      for await (const chunk of stream) {
        if (chunk === "AI_AUTH_REQUIRED") {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = "⚠️ 配置未就绪。请检查 API 环境。";
            return newMessages;
          });
          break;
        }

        fullContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = fullContent;
          return newMessages;
        });
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = "连接中断，请稍后重试。";
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 增强型 Aura 悬浮按钮 */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] bg-white text-black hover:scale-105 active:scale-90 shadow-[0_0_0_0_rgba(255,255,255,0)] hover:shadow-[0_20px_50px_-10px_rgba(255,255,255,0.4)] ${isOpen ? 'w-14 h-14 rounded-full rotate-180' : 'h-14 px-8 rounded-[1.25rem]'
            }`}
        >
          {/* 背景光晕层 */}
          <div className={`absolute inset-0 rounded-inherit opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-white blur-xl -z-10 scale-110`} />

          {isOpen ? (
            <span className="text-2xl font-light">×</span>
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="text-black/80">{ICONS.AI}</div>
                {/* 状态指示灯 */}
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_12px_#3b82f6]" />
              </div>
              <span className="font-bold tracking-tight text-sm select-none">Aura</span>
            </div>
          )}
        </button>
      </div>

      {/* 苹果风格弹性弹出面板 */}
      <div
        className={`fixed bottom-28 right-8 z-[90] w-[calc(100vw-4rem)] md:w-[420px] max-h-[75vh] bg-[#0d0d0d]/80 backdrop-blur-[60px] border border-white/10 rounded-[3rem] flex flex-col overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.9)] origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0 translate-x-0' : 'scale-[0.85] opacity-0 translate-y-12 translate-x-4 pointer-events-none blur-xl'
          }`}
      >
        {/* 高级感页眉 */}
        <div className="px-10 py-8 flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
            <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Assistant Aura</h3>
          </div>
          <div className="text-[10px] font-bold text-white/10 tracking-widest relative z-10">QWEN 2.5 NIM</div>
        </div>

        {/* 动态消息流 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-10 space-y-10 custom-scrollbar pb-10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
              <div className="w-20 h-20 mb-10 rounded-[2rem] glass-strong flex items-center justify-center text-white/5 rotate-3 scale-110">
                <div className="scale-150 opacity-40">{ICONS.AI}</div>
              </div>
              <h4 className="text-white text-2xl font-bold tracking-tighter mb-4">随时待命。</h4>
              <p className="text-white/30 text-sm font-light leading-relaxed max-w-[240px]">
                我是你的 AI 空间助手 Aura。<br />我们可以聊聊这里的代码、设计，或者任何你想分享的事。
              </p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`max-w-[85%] px-7 py-5 rounded-[2.2rem] text-[15px] leading-[1.7] tracking-wide ${m.role === 'user'
                    ? 'bg-white text-black font-semibold rounded-tr-none shadow-[0_15px_35px_-5px_rgba(255,255,255,0.15)]'
                    : 'text-white/90 rounded-tl-none bg-white/[0.04] border border-white/5'
                  }`}>
                  {m.content || (
                    <div className="flex gap-2 py-2">
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-duration:1s]" />
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-duration:1s] [animation-delay:200ms]" />
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-duration:1s] [animation-delay:400ms]" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 输入控制台 */}
        <div className="px-10 pb-10 pt-4">
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="有什有趣的想法吗？"
              className="w-full bg-white/[0.05] border border-white/10 rounded-[1.8rem] px-8 py-5 text-[15px] text-white placeholder-white/10 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all duration-500 shadow-inner"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`absolute right-3 top-3 w-11 h-11 rounded-[1.2rem] bg-white text-black flex items-center justify-center transition-all duration-500 ${input.trim() ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-75'
                } hover:scale-105 active:scale-90`}
            >
              {ICONS.CHEVRON_RIGHT}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .glass-strong {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(255,255,255,0.05); 
          border-radius: 10px;
        }
      `}</style>
    </>
  );
};

export default Assistant;
