
import React, { useState, useRef, useEffect } from 'react';
import { ICONS, BLOG_POSTS } from '../constants';
import { askGeminiStream } from '../services/geminiService';
import { Message } from '../types';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const Assistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [quotaError, setQuotaError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleInitKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setNeedsAuth(false);
      setQuotaError(false);
      setMessages([{ role: 'assistant', content: '很高兴再次见到你。在这里，我们可以聊聊任何让你动容的事。' }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setQuotaError(false);

    // 预置一个空的回复对象用于流式显示
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const blogContext = `文章列表: ${BLOG_POSTS.map(p => p.title).join(', ')}。`;
      const stream = askGeminiStream(currentInput, blogContext);
      
      let fullContent = '';
      for await (const chunk of stream) {
        if (chunk === "AI_AUTH_REQUIRED") {
          setNeedsAuth(true);
          setMessages(prev => prev.slice(0, -1));
          break;
        }
        if (chunk === "QUOTA_EXCEEDED") {
          setQuotaError(true);
          setMessages(prev => {
            const last = [...prev];
            last[last.length - 1].content = "抱歉，我的思绪现在有些拥挤，或许我们可以等一分钟，等安静下来后再继续聊？";
            return last;
          });
          break;
        }
        if (chunk.startsWith("ERROR:")) {
          setMessages(prev => {
            const last = [...prev];
            last[last.length - 1].content = chunk.replace("ERROR:", "");
            return last;
          });
          break;
        }

        fullContent += chunk;
        setMessages(prev => {
          const last = [...prev];
          last[last.length - 1].content = fullContent;
          return last;
        });
      }
    } catch (error) {
      setMessages(prev => {
        const last = [...prev];
        last[last.length - 1].content = "连接断开了，我的思绪似乎没能传达给你。";
        return last;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-[100] flex items-center justify-center h-14 transition-all duration-700 bg-white text-black hover:scale-110 active:scale-90 shadow-2xl ${isOpen ? 'w-14 rounded-full rotate-90' : 'px-8 rounded-2xl'}`}
      >
        {isOpen ? <span className="text-2xl font-light">×</span> : <div className="flex items-center gap-3">{ICONS.AI}<span className="font-bold tracking-tight text-sm">Aura</span></div>}
      </button>

      <div 
        className={`fixed bottom-28 right-8 z-[90] w-[calc(100vw-4rem)] md:w-[440px] max-h-[80vh] bg-[#050505]/95 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] flex flex-col overflow-hidden transition-all duration-700 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <div className="p-9 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-1000 ${isLoading ? 'bg-white shadow-[0_0_15px_white]' : 'bg-white/10'}`} />
            <h3 className="text-white/20 text-[10px] font-bold tracking-[0.5em] uppercase">Companion</h3>
          </div>
          <button onClick={() => setMessages([])} className="text-white/5 text-[9px] uppercase tracking-widest hover:text-white transition-colors">Clear</button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10">
          {messages.length === 0 && !needsAuth && (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in duration-1000">
              <div className="mb-10 opacity-10 scale-150">{ICONS.AI}</div>
              <p className="text-white/20 text-[13px] font-light tracking-[0.1em] leading-relaxed px-10">
                “在这些文字里，<br/>找到属于你的寂静。”
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-700`}>
              <div className={`max-w-[85%] px-7 py-5 rounded-[2.2rem] text-[15px] leading-[1.8] tracking-wide ${m.role === 'user' ? 'bg-white text-black font-semibold rounded-tr-none' : 'text-white/90 rounded-tl-none bg-white/[0.03] border border-white/5'}`}>
                {m.content}
              </div>
            </div>
          ))}

          {isLoading && !messages[messages.length-1].content && (
            <div className="flex justify-start items-center gap-4 text-white/10">
               <div className="flex gap-1.5">
                 <div className="w-1 h-1 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-1 h-1 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-1 h-1 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
               <span className="text-[10px] uppercase tracking-[0.4em] italic font-medium">Aura 正在思索...</span>
            </div>
          )}

          {needsAuth && (
            <div className="p-10 bg-white/[0.02] rounded-[3rem] border border-white/5 text-center space-y-8 animate-in zoom-in">
              <p className="text-white/30 text-xs leading-relaxed">我需要一个小小的许可，<br/>来重新唤醒我们之间的思想共鸣。</p>
              <button onClick={handleInitKey} className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl">建立连接</button>
            </div>
          )}
        </div>

        <div className="p-10">
          <div className={`flex items-center gap-4 bg-white/[0.03] rounded-[2.5rem] p-2 pl-8 border border-white/5 focus-within:border-white/20 transition-all duration-500 ${needsAuth ? 'opacity-10 pointer-events-none' : ''}`}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="分享一个你的想法..."
              className="flex-1 bg-transparent border-none outline-none text-[15px] text-white py-4 placeholder-white/5"
              disabled={isLoading || needsAuth}
            />
            <button 
              onClick={handleSend}
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-500 ${input.trim() ? 'bg-white text-black scale-100 shadow-lg' : 'bg-transparent text-white/5 scale-90'}`}
              disabled={isLoading || !input.trim()}
            >
              {ICONS.CHEVRON_RIGHT}
            </button>
          </div>
          {quotaError && (
            <p className="mt-5 text-[9px] text-white/10 text-center uppercase tracking-[0.4em] font-medium">
              此刻似乎人声鼎沸，稍后再回来找我。
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Assistant;
