
import React, { useState, useRef, useEffect } from 'react';
import { ICONS, BLOG_POSTS } from '../constants';
import { askGeminiStream } from '../services/geminiService';
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
      const stream = askGeminiStream(currentInput, context);
      
      let fullContent = '';
      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = fullContent;
          return newMessages;
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
      {/* 悬浮触发按钮 */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-[100] flex items-center justify-center h-14 transition-all duration-700 bg-white text-black hover:scale-110 active:scale-95 shadow-[0_20px_60px_-10px_rgba(255,255,255,0.3)] ${
          isOpen ? 'w-14 rounded-full rotate-90' : 'px-8 rounded-2xl'
        }`}
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

      {/* 聊天面板 */}
      <div 
        className={`fixed bottom-28 right-8 z-[90] w-[calc(100vw-4rem)] md:w-[420px] max-h-[70vh] bg-[#0a0a0a]/90 backdrop-blur-[50px] border border-white/10 rounded-[3rem] flex flex-col overflow-hidden transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) shadow-[0_80px_160px_-40px_rgba(0,0,0,0.8)] origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-20 pointer-events-none'
        }`}
      >
        {/* 页眉 */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <h3 className="text-white text-xs font-bold uppercase tracking-widest opacity-40">Aura AI</h3>
          </div>
        </div>

        {/* 消息区域 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-in fade-in duration-1000">
              <div className="w-16 h-16 mb-8 rounded-2xl bg-white/5 flex items-center justify-center text-white/10 scale-125 border border-white/5">
                {ICONS.AI}
              </div>
              <h4 className="text-white/80 text-lg font-bold tracking-tight mb-2">Hello, Friend.</h4>
              <p className="text-white/20 text-xs font-light tracking-wide leading-relaxed max-w-[200px]">
                我是 Aura，你可以问我关于本博客的内容，或只是简单聊聊。
              </p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div 
                key={i} 
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
              >
                <div className={`max-w-[90%] px-6 py-4 rounded-[1.8rem] text-sm leading-[1.7] tracking-wide ${
                  m.role === 'user' 
                    ? 'bg-white text-black font-semibold rounded-tr-none' 
                    : 'text-white/80 rounded-tl-none bg-white/[0.03] border border-white/5'
                }`}>
                  {m.content || (
                    <div className="flex gap-1 py-1">
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:200ms]" />
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:400ms]" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 输入框 */}
        <div className="p-8 pt-0">
          <div className="relative group">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder-white/10 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-500"
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center opacity-0 translate-x-2 group-focus-within:opacity-100 group-focus-within:translate-x-0 transition-all duration-500 disabled:opacity-0"
            >
              {ICONS.CHEVRON_RIGHT}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(255,255,255,0.03); 
          border-radius: 10px;
        }
      `}</style>
    </>
  );
};

export default Assistant;
