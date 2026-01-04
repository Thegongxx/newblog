
import React, { useState, useRef, useEffect } from 'react';
import { ICONS, BLOG_POSTS } from '../constants';
import { askGemini } from '../services/geminiService';
import { Message } from '../types';

const Assistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Create a context summary from current BLOG_POSTS
    const blogContext = `The blog currently has these posts: ${BLOG_POSTS.map(p => `"${p.title}" (Category: ${p.category}, Summary: ${p.excerpt})`).join('; ')}`;

    const response = await askGemini(input, blogContext);
    const assistantMsg: Message = { role: 'assistant', content: response };
    
    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Dynamic Island style button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-50 flex items-center justify-center h-14 transition-all duration-500 bg-white text-black hover:scale-105 active:scale-95 shadow-2xl ${isOpen ? 'w-14 rounded-full rotate-45' : 'px-6 rounded-2xl'}`}
      >
        {isOpen ? (
          <span className="text-2xl">+</span>
        ) : (
          <div className="flex items-center gap-3">
            {ICONS.AI}
            <span className="font-medium">Ask Aura</span>
          </div>
        )}
      </button>

      {/* Chat Interface */}
      <div 
        className={`fixed bottom-28 right-8 z-40 w-[calc(100vw-4rem)] md:w-96 max-h-[70vh] bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex flex-col overflow-hidden transition-all duration-500 shadow-2xl origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'}`}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Assistant
          </h3>
          <button onClick={() => setMessages([])} className="text-white/40 text-xs hover:text-white transition-colors">Clear chat</button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px]">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="p-4 bg-white/5 rounded-full mb-4">
                {ICONS.AI}
              </div>
              <p className="text-white/60 text-sm">
                Ask me anything about the blog posts, design, or the meaning of life.
              </p>
            </div>
          )}
          
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-white text-black rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                {m.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 p-3 rounded-2xl flex gap-1">
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white/5">
          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-2 pl-4 border border-white/10 focus-within:border-white/30 transition-colors">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="What's on your mind?"
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/30"
            />
            <button 
              onClick={handleSend}
              className="p-2 bg-white text-black rounded-lg hover:bg-opacity-80 transition-opacity"
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
