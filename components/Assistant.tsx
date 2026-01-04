
import React, { useState, useRef, useEffect } from 'react';
import { ICONS, BLOG_POSTS } from '../constants';
import { askGemini } from '../services/geminiService';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          if (!hasKey && !process.env.API_KEY) {
            setNeedsAuth(true);
          }
        } catch (e) {
          setNeedsAuth(true);
        }
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleInitKey = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setNeedsAuth(false);
        setMessages([{
          role: 'assistant',
          content: '核心架构已连接。我是 Aura，你的深思伙伴。'
        }]);
      } catch (err) {
        console.error("Auth Failed", err);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const blogContext = `文章列表: ${BLOG_POSTS.map(p => p.title).join(', ')}。主题: 设计、科技与哲学的交集。`;
      const response = await askGemini(currentInput, blogContext);
      
      if (response === "AI_AUTH_REQUIRED") {
        setNeedsAuth(true);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '连接有些波动，思维正在重组。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-[100] flex items-center justify-center h-14 transition-all duration-700 bg-white text-black hover:scale-110 active:scale-90 shadow-[0_20px_50px_rgba(255,255,255,0.15)] ${isOpen ? 'w-14 rounded-full rotate-90' : 'px-6 rounded-2xl'}`}
      >
        {isOpen ? <span className="text-2xl font-light">×</span> : <div className="flex items-center gap-3">{ICONS.AI}<span className="font-semibold tracking-tight">Aura Pro</span></div>}
      </button>

      <div 
        className={`fixed bottom-28 right-8 z-[90] w-[calc(100vw-4rem)] md:w-[420px] max-h-[75vh] bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex flex-col overflow-hidden transition-all duration-700 shadow-[0_50px_100px_rgba(0,0,0,0.8)] origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <div className="p-7 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] ${isLoading ? 'bg-blue-400 animate-pulse' : 'bg-white'}`} />
            <h3 className="text-white text-sm font-bold tracking-widest uppercase">Aura Intelligence</h3>
          </div>
          <button onClick={() => setMessages([])} className="text-white/20 text-[10px] uppercase tracking-widest hover:text-white transition-colors">Reset</button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 min-h-[400px]">
          {messages.length === 0 && !needsAuth && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <div className="mb-6 scale-150">{ICONS.AI}</div>
              <p className="text-xs font-light tracking-[0.2em] leading-loose max-w-[200px]">
                输入你的思考<br/>
                Aura 将为你深度解析
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
              <div className={`max-w-[90%] px-5 py-3.5 rounded-3xl text-[15px] leading-relaxed tracking-wide ${m.role === 'user' ? 'bg-white text-black font-medium rounded-tr-none shadow-xl' : 'bg-white/[0.05] text-white/90 rounded-tl-none border border-white/10'}`}>
                {m.content}
              </div>
            </div>
          ))}

          {needsAuth && (
            <div className="flex flex-col items-center justify-center p-10 bg-white/[0.03] rounded-[3rem] border border-white/10 mx-2 animate-in zoom-in duration-500">
              <div className="w-16 h-16 bg-white/10 rounded-[2rem] flex items-center justify-center mb-6 scale-110">{ICONS.AI}</div>
              <h4 className="text-white text-lg font-bold mb-3 tracking-tight">唤醒高级智能</h4>
              <p className="text-white/40 text-xs text-center mb-8 leading-relaxed px-4">
                点击下方按钮进行安全验证，<br/>解锁基于 Gemini 3 Pro 的深度推理能力。
              </p>
              <button 
                onClick={handleInitKey}
                className="w-full py-4 bg-white text-black text-sm font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.97] shadow-2xl"
              >
                连接 AURA 核心
              </button>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/[0.03] px-5 py-4 rounded-3xl flex gap-2 items-center border border-white/5">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-[bounce_1s_infinite]" />
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-[bounce_1s_infinite_0.2s]" />
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-[bounce_1s_infinite_0.4s]" />
                <span className="ml-2 text-[10px] text-white/20 uppercase tracking-widest font-bold">Thinking</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-black border-t border-white/5">
          <div className={`flex items-center gap-3 bg-white/[0.04] rounded-[2rem] p-2 pl-6 border border-white/10 focus-within:border-white/40 focus-within:bg-white/[0.07] transition-all duration-500 ${needsAuth ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={needsAuth ? "等待连接..." : "在此处输入你的洞见..."}
              className="flex-1 bg-transparent border-none outline-none text-[15px] text-white placeholder-white/10 py-2"
              disabled={isLoading || needsAuth}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim() || needsAuth}
              className="w-11 h-11 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-90 transition-all disabled:opacity-0 shadow-lg"
            >
              {ICONS.CHEVRON_RIGHT}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Assistant;
