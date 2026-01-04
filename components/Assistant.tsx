
import React, { useState, useRef, useEffect } from 'react';
import { ICONS, BLOG_POSTS } from '../constants';
import { askGemini } from '../services/geminiService';
import { Message } from '../types';

// Use correct global interface declaration to fix TypeScript errors
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio: AIStudio;
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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Check for API Key selection on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey && !process.env.API_KEY) {
          setNeedsAuth(true);
        }
      }
    };
    checkAuth();
  }, []);

  const handleInitKey = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Assume key selection was successful after triggering openSelectKey to avoid race conditions
        setNeedsAuth(false);
        setMessages([{
          role: 'assistant',
          content: 'AI initialized successfully. How can I help you today?'
        }]);
      }
    } catch (e) {
      console.error("Key selection failed", e);
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
      const blogContext = `The blog currently has these posts: ${BLOG_POSTS.map(p => `"${p.title}" (Category: ${p.category}, Summary: ${p.excerpt})`).join('; ')}`;

      const response = await askGemini(currentInput, blogContext);
      
      if (response === "AI_AUTH_MISSING") {
        setNeedsAuth(true);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'I need authorization to access the AI brain. Please click the button below to initialize.' 
        }]);
      } else if (response === "AI_ERROR_NOT_FOUND") {
        // If Requested entity was not found, reset key selection state
        setNeedsAuth(true);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'The requested AI resource was not found. Please re-select your API key via the button below.' 
        }]);
      } else {
        const assistantMsg: Message = { role: 'assistant', content: response };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: Unable to connect. (${error.message})` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-50 flex items-center justify-center h-14 transition-all duration-500 bg-white text-black hover:scale-105 active:scale-95 shadow-2xl ${isOpen ? 'w-14 rounded-full rotate-45' : 'px-6 rounded-2xl'}`}
      >
        {isOpen ? (
          <span className="text-2xl font-light">×</span>
        ) : (
          <div className="flex items-center gap-3">
            {ICONS.AI}
            <span className="font-medium">Ask Aura</span>
          </div>
        )}
      </button>

      <div 
        className={`fixed bottom-28 right-8 z-40 w-[calc(100vw-4rem)] md:w-96 max-h-[70vh] bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex flex-col overflow-hidden transition-all duration-500 shadow-2xl origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'}`}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></span>
            Assistant
          </h3>
          <button onClick={() => {setMessages([]); setNeedsAuth(false);}} className="text-white/40 text-xs hover:text-white transition-colors">Clear</button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px]">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="p-4 bg-white/5 rounded-full mb-4">
                {ICONS.AI}
              </div>
              <p className="text-white/60 text-sm font-light">
                I'm your spatial assistant. Ask me anything about the blog.
              </p>
            </div>
          )}
          
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-white text-black rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/5'}`}>
                {m.content}
              </div>
            </div>
          ))}
          
          {needsAuth && (
            <div className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/10 animate-pulse">
              <p className="text-xs text-white/60 mb-3 text-center">API Key selection required for AI access.</p>
              <button 
                onClick={handleInitKey}
                className="w-full py-2 bg-white text-black text-sm font-bold rounded-xl hover:bg-white/90 transition-colors"
              >
                Initialize AI
              </button>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[10px] text-white/20 mt-2 hover:underline">About Billing</a>
            </div>
          )}

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
              placeholder={needsAuth ? "Please initialize first" : "What's on your mind?"}
              disabled={isLoading || needsAuth}
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/30"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim() || needsAuth}
              className="p-2 bg-white text-black rounded-lg hover:bg-opacity-80 transition-all disabled:opacity-20"
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
