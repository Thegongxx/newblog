
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
  const [isInitializing, setIsInitializing] = useState(false);
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
      } else {
        // 如果 aistudio 还没准备好，延迟重试
        setTimeout(checkAuth, 1000);
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
    // 强制阻止所有可能的冒泡
    e.preventDefault();
    e.stopPropagation();
    
    if (isInitializing) return;
    setIsInitializing(true);

    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // 触发后立即假设授权流程启动，并更新 UI 状态
        setNeedsAuth(false);
        setMessages([{
          role: 'assistant',
          content: 'Aura Reasoning 已就绪。逻辑推理模块已加载，深度思考能力已开启。'
        }]);
      } catch (err) {
        console.error("Auth Failed", err);
        alert("授权窗口被拦截，请允许弹窗后重试。");
      } finally {
        setIsInitializing(false);
      }
    } else {
      alert("AI 环境仍在准备中，请刷新页面或稍等几秒。");
      setIsInitializing(false);
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
      const blogContext = `文章列表: ${BLOG_POSTS.map(p => p.title).join(', ')}。`;
      const response = await askGemini(currentInput, blogContext);
      
      if (response === "AI_AUTH_REQUIRED") {
        setNeedsAuth(true);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '由于不可抗力，思维链路暂时中断。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Entry Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-[100] flex items-center justify-center h-14 transition-all duration-700 bg-white text-black hover:scale-110 active:scale-90 shadow-2xl ${isOpen ? 'w-14 rounded-full rotate-90' : 'px-6 rounded-2xl'}`}
      >
        {isOpen ? <span className="text-2xl font-light">×</span> : <div className="flex items-center gap-3">{ICONS.AI}<span className="font-bold tracking-tight">Aura Reasoning</span></div>}
      </button>

      {/* Main Panel */}
      <div 
        className={`fixed bottom-28 right-8 z-[90] w-[calc(100vw-4rem)] md:w-[440px] max-h-[75vh] bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex flex-col overflow-hidden transition-all duration-700 shadow-2xl origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto' : 'scale-95 opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="p-7 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-cyan-400 animate-pulse' : 'bg-white/40'}`} />
            <h3 className="text-white/60 text-[10px] font-bold tracking-[0.3em] uppercase">Deep Intelligence</h3>
          </div>
          <button onClick={() => setMessages([])} className="text-white/20 text-[10px] uppercase tracking-widest hover:text-white transition-colors">Clear</button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 min-h-[400px]">
          {messages.length === 0 && !needsAuth && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <div className="mb-6 scale-125">{ICONS.AI}</div>
              <p className="text-xs font-light tracking-[0.2em] leading-loose max-w-[220px]">
                输入复杂逻辑问题<br/>
                体验深度推理
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
              <div className={`max-w-[92%] px-6 py-4 rounded-[2rem] text-[15px] leading-relaxed tracking-wide ${m.role === 'user' ? 'bg-white text-black font-semibold rounded-tr-none' : 'bg-white/[0.04] text-white/90 rounded-tl-none border border-white/5 shadow-inner'}`}>
                {m.content}
              </div>
            </div>
          ))}

          {needsAuth && (
            <div className="flex flex-col items-center justify-center p-12 bg-white/[0.03] rounded-[3rem] border border-white/10 mx-2 animate-in zoom-in duration-500">
              <div className="w-16 h-16 bg-white/10 rounded-[2rem] flex items-center justify-center mb-8">{ICONS.AI}</div>
              <h4 className="text-white text-xl font-bold mb-3 tracking-tight text-center">初始化深度思维模块</h4>
              <p className="text-white/30 text-xs text-center mb-10 leading-relaxed px-4">
                点击下方按钮进行安全授权。<br/>授权后将解锁基于 Gemini 3 Pro 的<br/><span className="text-white/60 font-bold italic">类 DeepSeek 推理能力</span>。
              </p>
              <button 
                onClick={handleInitKey}
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                className={`w-full py-5 bg-white text-black text-sm font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.96] shadow-[0_15px_30px_rgba(255,255,255,0.1)] relative z-[110] ${isInitializing ? 'opacity-50' : 'opacity-100'}`}
              >
                {isInitializing ? "正在启动..." : "激活 AURA 深度推理"}
              </button>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-cyan-500/5 px-6 py-4 rounded-[2rem] flex flex-col gap-2 border border-cyan-500/20">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] text-cyan-400/60 uppercase tracking-[0.2em] font-black italic">Deep Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-black border-t border-white/5">
          <div className={`flex items-center gap-3 bg-white/[0.03] rounded-[2rem] p-2 pl-6 border border-white/10 focus-within:border-cyan-500/40 focus-within:bg-white/[0.06] transition-all duration-500 ${needsAuth ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={needsAuth ? "等待授权..." : "提出一个深刻的问题..."}
              className="flex-1 bg-transparent border-none outline-none text-[15px] text-white placeholder-white/10 py-3"
              disabled={isLoading || needsAuth}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim() || needsAuth}
              className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-90 transition-all disabled:opacity-0 shadow-xl"
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
