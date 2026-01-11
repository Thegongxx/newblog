import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ICONS } from '../constants';
import { askNvidiaStream } from '../services/nvidiaService';
import { Message } from '../types';

const TypingIndicator = () => (
  <div className="flex gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-gray-400 rounded-full"
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
  
  // 可访问性支持
  const prefersReducedMotion = useReducedMotion();
  
  // 触摸设备检测
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);

  // 优化的状态切换处理 - 完全重写，模仿Google的交互
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleToggle = useCallback(() => {
    // 防止动画期间的重复点击
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsOpen(prev => !prev);
    
    // 动画完成后重置状态
    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
  }, [isAnimating]);

  // 键盘导航支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleToggle();
      }
      
      // Alt + A 快捷键打开/关闭AI助手
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        handleToggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleToggle]);

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
      {/* Google Material Design风格的FAB按钮 */}
      <motion.button
        onClick={handleToggle}
        disabled={isAnimating}
        className={`fixed bottom-8 right-8 z-50 flex items-center justify-center bg-white shadow-lg border-0 focus:outline-none focus:ring-0 overflow-hidden
                   max-sm:bottom-6 max-sm:right-6 max-sm:scale-90 ${isAnimating ? 'pointer-events-none' : ''}`}
        style={{
          height: '56px',
          borderRadius: '28px',
          willChange: 'transform, width',
          backfaceVisibility: 'hidden',
        }}
        initial={false}
        animate={{
          width: isOpen ? 56 : 120,
          paddingLeft: isOpen ? 0 : 16,
          paddingRight: isOpen ? 0 : 16,
        }}
        transition={{
          type: "tween",
          duration: 0.3,
          ease: [0.4, 0.0, 0.2, 1], // Google's standard easing
        }}
        whileHover={!isAnimating ? {
          scale: 1.05,
          boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          transition: {
            duration: 0.2,
            ease: [0.4, 0.0, 0.2, 1]
          }
        } : {}}
        whileTap={!isAnimating ? {
          scale: 0.95,
          transition: {
            duration: 0.1,
            ease: [0.4, 0.0, 0.2, 1]
          }
        } : {}}
        aria-label={isOpen ? "关闭AI助手" : "打开AI助手"}
        aria-expanded={isOpen}
      >
        {/* Ripple效果背景 */}
        <motion.div
          className="absolute inset-0 bg-black/5 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
        
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              initial={{ opacity: 0, rotate: -180, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 180, scale: 0.5 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1]
              }}
              className="relative flex items-center justify-center w-6 h-6"
            >
              {/* Material Design Close Icon */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="text-gray-700"
              >
                <motion.path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                  fill="currentColor"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="open-content"
              initial={{ opacity: 0, x: -10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1]
              }}
              className="flex items-center gap-3"
            >
              <motion.div
                className="text-gray-700 text-lg"
                animate={prefersReducedMotion ? {} : {
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={prefersReducedMotion ? {} : {
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
              >
                {ICONS.AI}
              </motion.div>
              <span className="font-medium text-sm text-gray-800 tracking-normal">
                Aura
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 优化的聊天面板 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 - Material Design风格 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.25,
                ease: [0.4, 0.0, 0.2, 1]
              }}
              className="fixed inset-0 bg-black/40 z-30"
              style={{ 
                willChange: 'opacity',
                backfaceVisibility: 'hidden'
              }}
              onClick={handleToggle}
              aria-label="点击关闭AI助手"
            />
            
            {/* 聊天面板 - Material Design风格 */}
            <motion.div
              initial={{ 
                opacity: 0, 
                y: 40, 
                scale: 0.9
              }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1
              }}
              exit={{ 
                opacity: 0, 
                y: 40, 
                scale: 0.9
              }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1]
              }}
              className="fixed bottom-28 right-8 z-40 w-96 max-w-[calc(100vw-2rem)] max-h-[32rem] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl flex flex-col overflow-hidden shadow-2xl
                         sm:w-96 sm:bottom-28 sm:right-8
                         max-sm:w-[calc(100vw-1rem)] max-sm:bottom-24 max-sm:right-2 max-sm:left-2 max-sm:mx-auto max-sm:max-h-[70vh]"
              style={{
                boxShadow: '0 24px 38px rgba(0,0,0,0.4), 0 9px 46px rgba(0,0,0,0.24)',
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden'
              }}
              role="dialog"
              aria-label="AI助手聊天面板"
              aria-modal="true"
            >
              {/* Header - Material Design风格 */}
              <motion.div 
                className="px-6 py-5 border-b border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-gray-800/50 to-gray-900/30"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.1, 
                  duration: 0.25,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={prefersReducedMotion ? {} : { 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={prefersReducedMotion ? {} : { 
                      duration: 2, 
                      repeat: Infinity,
                      ease: [0.4, 0.0, 0.2, 1]
                    }}
                  />
                  <h3 className="text-gray-300 text-xs font-medium uppercase tracking-wider">Assistant Aura</h3>
                </div>
                {rateLimited && (
                  <motion.span 
                    className="text-xs text-amber-400 bg-amber-900/30 px-2 py-1 rounded-full border border-amber-700/30"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ 
                      duration: 0.2,
                      ease: [0.4, 0.0, 0.2, 1]
                    }}
                  >
                    冷却中 {rateLimited}s
                  </motion.span>
                )}
              </motion.div>

              {/* Messages - Material Design风格 */}
              <div 
                ref={scrollRef} 
                className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-gray-800/20 to-gray-900/10"
                style={{ 
                  willChange: 'scroll-position',
                  backfaceVisibility: 'hidden'
                }}
              >
                {messages.length === 0 ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 0.2, 
                      duration: 0.3,
                      ease: [0.4, 0.0, 0.2, 1]
                    }}
                  >
                    <motion.div 
                      className="text-gray-500 mb-4 text-2xl"
                      animate={prefersReducedMotion ? {} : { 
                        rotate: [0, 3, -3, 0],
                        scale: [1, 1.02, 1]
                      }}
                      transition={prefersReducedMotion ? {} : { 
                        duration: 4, 
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: [0.4, 0.0, 0.2, 1]
                      }}
                    >
                      {ICONS.AI}
                    </motion.div>
                    <p className="text-gray-300 text-sm font-medium">我是你的 AI 助手 Aura</p>
                    <p className="text-gray-500 text-xs mt-2">有什么可以帮助你的吗？</p>
                  </motion.div>
                ) : (
                  messages.map((m, i) => (
                    <motion.div 
                      key={i} 
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: Math.min(i * 0.05, 0.2),
                        duration: 0.25,
                        ease: [0.4, 0.0, 0.2, 1]
                      }}
                    >
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                        m.role === 'user' 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'bg-gray-800/80 text-gray-200 border border-gray-700/50'
                      }`}>
                        {m.content || <TypingIndicator />}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Retry Button - 黑色主题 */}
              {retryInfo.show && !isLoading && (
                <motion.div 
                  className="px-6 pb-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ 
                    duration: 0.15,
                    ease: "easeOut"
                  }}
                  style={{ 
                    willChange: 'height, opacity',
                    backfaceVisibility: 'hidden'
                  }}
                >
                  <button
                    onClick={handleRetry}
                    className="w-full py-2 text-sm text-gray-400 hover:text-gray-200 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-150 border border-gray-700/50 hover:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
                    aria-label="重试发送消息"
                  >
                    🔄 重试
                  </button>
                </motion.div>
              )}

              {/* Input - Material Design风格 */}
              <motion.div 
                className="px-6 pb-6 bg-gradient-to-t from-gray-800/50 to-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.15, 
                  duration: 0.25,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
              >
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                    placeholder={rateLimited ? `请等待 ${rateLimited} 秒...` : '有什么想聊的吗？'}
                    className="w-full bg-gray-800/80 border border-gray-700/50 rounded-2xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-600/50 focus:bg-gray-800 transition-all duration-200 disabled:opacity-50 shadow-sm focus:ring-2 focus:ring-blue-500/30"
                    disabled={isLoading || !!rateLimited}
                    aria-label="输入消息"
                  />
                  <motion.button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading || !!rateLimited}
                    className={`absolute right-2 top-2 w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      input.trim() && !rateLimited ? 'opacity-100 hover:bg-blue-500' : 'opacity-30'
                    }`}
                    whileHover={input.trim() && !rateLimited ? { 
                      scale: 1.05,
                      transition: { duration: 0.15, ease: [0.4, 0.0, 0.2, 1] }
                    } : {}}
                    whileTap={input.trim() && !rateLimited ? { 
                      scale: 0.95,
                      transition: { duration: 0.1, ease: [0.4, 0.0, 0.2, 1] }
                    } : {}}
                    aria-label="发送消息"
                  >
                    {ICONS.CHEVRON_RIGHT}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Assistant;