import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ICONS } from '../constants';
import { askNvidiaStream } from '../services/nvidiaService';
import { Message } from '../types';

const TypingIndicator = () => (
  <div className="flex gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-white/40 rounded-full"
        animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

const Assistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [retryInfo, setRetryInfo] = useState<{ show: boolean; lastPrompt: string }>({ show: false, lastPrompt: '' });
  const [rateLimited, setRateLimited] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Rate limit countdown
  useEffect(() => {
    if (rateLimited && rateLimited > 0) {
      const timer = setInterval(() => {
        setRateLimited(prev => (prev && prev > 1 ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [rateLimited]);

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim() || isLoading || rateLimited) return;

    const userMsg: Message = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setInput('');
    setIsLoading(true);
    setRetryInfo({ show: false, lastPrompt: prompt });

    try {
      const context = `这是一个名为 Aura 的极简主义个人博客，专注于设计、技术和生活思考。`;
      const stream = askNvidiaStream(prompt, context);

      let fullContent = '';
      for await (const chunk of stream) {
        // Handle special messages
        if (chunk.startsWith('RATE_LIMITED:')) {
          const waitTime = parseInt(chunk.split(':')[1]);
          setRateLimited(waitTime);
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = `⏳ 请求过于频繁，请等待 ${waitTime} 秒后重试`;
            return newMessages;
          });
          break;
        }

        if (chunk.startsWith('RETRY:')) {
          const [, attempt, max] = chunk.split(':');
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = `🔄 重试中 (${attempt}/${max})...`;
            return newMessages;
          });
          continue;
        }

        if (chunk.startsWith('ERROR:')) {
          const errorMsg = chunk.slice(6);
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = `❌ ${errorMsg}`;
            return newMessages;
          });
          setRetryInfo({ show: true, lastPrompt: prompt });
          break;
        }

        if (chunk === 'AI_AUTH_REQUIRED') {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = '⚠️ 配置未就绪，请检查 API 环境';
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
    } catch {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = '❌ 连接中断，请稍后重试';
        return newMessages;
      });
      setRetryInfo({ show: true, lastPrompt: prompt });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryInfo.lastPrompt) {
      // Remove last failed message pair
      setMessages(prev => prev.slice(0, -2));
      sendMessage(retryInfo.lastPrompt);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-50 flex items-center justify-center bg-white text-black shadow-lg ${
          isOpen ? 'w-14 h-14 rounded-full' : 'h-14 px-6 rounded-2xl'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? '×' : (
          <div className="flex items-center gap-2">
            <span className="text-black/80">{ICONS.AI}</span>
            <span className="font-bold text-sm">Aura</span>
          </div>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 right-8 z-40 w-96 max-h-[28rem] bg-black/90 border border-white/10 rounded-3xl flex flex-col overflow-hidden backdrop-blur-md"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider">Assistant Aura</h3>
              {rateLimited && (
                <span className="text-xs text-amber-400">冷却中 {rateLimited}s</span>
              )}
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
                      m.role === 'user' ? 'bg-white text-black' : 'bg-white/10 text-white/90'
                    }`}>
                      {m.content || <TypingIndicator />}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Retry Button */}
            {retryInfo.show && !isLoading && (
              <div className="px-6 pb-2">
                <button
                  onClick={handleRetry}
                  className="w-full py-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  🔄 重试
                </button>
              </div>
            )}

            {/* Input */}
            <div className="px-6 pb-6">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder={rateLimited ? `请等待 ${rateLimited} 秒...` : '有什么想聊的吗？'}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40 disabled:opacity-50"
                  disabled={isLoading || !!rateLimited}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading || !!rateLimited}
                  className={`absolute right-2 top-2 w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center transition-opacity ${
                    input.trim() && !rateLimited ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  {ICONS.CHEVRON_RIGHT}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Assistant;
