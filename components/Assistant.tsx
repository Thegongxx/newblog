
import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../constants';
import { askNvidiaStream } from '../services/nvidiaService';
import { Message } from '../types';

const Assistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setInput('');
    setIsLoading(true);

    try {
      const context = `这是一个名为 Aura 的极简主义个人博客，专注于设计、技术和生活思考。`;
      const stream = askNvidiaStream(input, context);

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
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-50 flex items-center justify-center transition-all duration-300 bg-white text-black hover:scale-105 shadow-lg ${
          isOpen ? 'w-14 h-14 rounded-full' : 'h-14 px-6 rounded-2xl'
        }`}
      >
        {isOpen ? (
          <span className="text-xl">×</span>
        ) : (
          <div className="flex items-center gap-2">
            <div className="text-black/80">{ICONS.AI}</div>
            <span className="font-bold text-sm">Aura</span>
          </div>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-28 right-8 z-40 w-96 max-h-96 bg-black/90 border border-white/10 rounded-3xl flex flex-col overflow-hidden backdrop-blur-md">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider">Assistant Aura</h3>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-white/20 mb-4">{ICONS.AI}</div>
                <p className="text-white/40 text-sm">我是你的 AI 助手 Aura</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    m.role === 'user'
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white/90'
                  }`}>
                    {m.content || (
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                        <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="px-6 pb-6">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="有什么想聊的吗？"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`absolute right-2 top-2 w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center transition-all ${
                  input.trim() ? 'opacity-100' : 'opacity-30'
                }`}
              >
                {ICONS.CHEVRON_RIGHT}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Assistant;
