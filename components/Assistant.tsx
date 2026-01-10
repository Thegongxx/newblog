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
        className="w-2 h-2 bg-black/40 rounded-full"
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

  // 优化的状态切换处理 - 添加动画预处理
  const handleToggle = useCallback(() => {
    // 预先设置will-change以优化动画性能
    const button = document.querySelector('[aria-label*="AI助手"]') as HTMLElement;
    if (button) {
      button.style.willChange = 'transform, width, padding';
      // 动画完成后清理will-change
      setTimeout(() => {
        button.style.willChange = 'auto';
      }, 400);
    }
    setIsOpen(prev => !prev);
  }, []);

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
      {/* 优化的浮动按钮 - 更丝滑的动画和性能优化 */}
      <motion.button
        onClick={handleToggle}
        className="fixed bottom-8 right-8 z-50 flex items-center justify-center bg-white/95 backdrop-blur-xl text-black shadow-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-black/20 focus:ring-offset-2
                   max-sm:bottom-6 max-sm:right-6 max-sm:scale-90"
        style={{
          height: '56px',
          borderRadius: '28px',
          willChange: isOpen ? 'auto' : 'transform, width, padding',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          width: isOpen ? 56 : 'auto',
          paddingLeft: isOpen ? 0 : 24,
          paddingRight: isOpen ? 0 : 24,
        }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 22,
          mass: 0.5,
          velocity: 2
        }}
        whileHover={{ 
          scale: isTouchDevice ? 1 : 1.02,
          boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
          transition: { 
            duration: 0.12,
            ease: "easeOut"
          }
        }}
        whileTap={{ 
          scale: isTouchDevice ? 0.94 : 0.98,
          transition: { 
            duration: 0.06,
            ease: "easeInOut"
          }
        }}
        aria-label={isOpen ? "关闭AI助手" : "打开AI助手"}
        aria-expanded={isOpen}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
                mass: 0.3
              }}
              className="text-2xl font-light text-black/80"
              style={{ willChange: 'transform, opacity' }}
            >
              ×
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0, x: -6, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 6, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
                mass: 0.3
              }}
              className="flex items-center gap-3"
              style={{ willChange: 'transform, opacity' }}
            >
              <motion.span 
                className="text-black/70 text-lg"
                animate={prefersReducedMotion ? {} : { 
                  rotate: [0, 6, -6, 0],
                  scale: [1, 1.02, 1]
                }}
                transition={prefersReducedMotion ? {} : { 
                  duration: 2.5, 
                  repeat: Infinity, 
                  repeatDelay: 4,
                  ease: "easeInOut"
                }}
                style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
              >
                {ICONS.AI}
              </motion.span>
              <span className="font-bold text-sm text-black/80 tracking-tight">Aura</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 优化的聊天面板 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 - 更快速的淡入淡出和GPU加速 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.15,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
              style={{ 
                willChange: 'opacity',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
              }}
              onClick={handleToggle}
              aria-label="点击关闭AI助手"
            />
            
            {/* 聊天面板 - 优化的3D效果和性能 */}
            <motion.div
              initial={{ 
                opacity: 0, 
                y: 20, 
                scale: 0.95,
                rotateX: -6
              }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                rotateX: 0
              }}
              exit={{ 
                opacity: 0, 
                y: 20, 
                scale: 0.95,
                rotateX: -6
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                mass: 0.6,
                opacity: { duration: 0.15 }
              }}
              className="fixed bottom-28 right-8 z-40 w-96 max-w-[calc(100vw-2rem)] max-h-[32rem] bg-white/95 backdrop-blur-xl border border-white/30 rounded-3xl flex flex-col overflow-hidden shadow-2xl
                         sm:w-96 sm:bottom-28 sm:right-8
                         max-sm:w-[calc(100vw-1rem)] max-sm:bottom-24 max-sm:right-2 max-sm:left-2 max-sm:mx-auto max-sm:max-h-[70vh]"
              style={{
                boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)',
                willChange: 'transform, opacity',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                perspective: '1000px'
              }}
              role="dialog"
              aria-label="AI助手聊天面板"
              aria-modal="true"
            >
              {/* Header */}
              <motion.div 
                className="px-6 py-5 border-b border-black/10 flex items-center justify-between bg-gradient-to-r from-white/50 to-white/30"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.08, 
                  duration: 0.15,
                  ease: "easeOut"
                }}
                style={{ willChange: 'transform, opacity' }}
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={prefersReducedMotion ? {} : { 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={prefersReducedMotion ? {} : { 
                      duration: 2, 
                      repeat: Infinity 
                    }}
                    style={{ willChange: prefersReducedMotion ? 'auto' : 'transform, opacity' }}
                  />
                  <h3 className="text-black/70 text-xs font-bold uppercase tracking-wider">Assistant Aura</h3>
                </div>
                {rateLimited && (
                  <motion.span 
                    className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ 
                      duration: 0.15,
                      ease: "easeOut"
                    }}
                    style={{ willChange: 'transform, opacity' }}
                  >
                    冷却中 {rateLimited}s
                  </motion.span>
                )}
              </motion.div>

              {/* Messages */}
              <div 
                ref={scrollRef} 
                className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-white/20 to-white/10"
                style={{ 
                  willChange: 'scroll-position',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden'
                }}
              >
                {messages.length === 0 ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 0.15, 
                      duration: 0.15,
                      ease: "easeOut"
                    }}
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <motion.div 
                      className="text-black/30 mb-4 text-2xl"
                      animate={prefersReducedMotion ? {} : { 
                        rotate: [0, 4, -4, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={prefersReducedMotion ? {} : { 
                        duration: 3, 
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                      style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
                    >
                      {ICONS.AI}
                    </motion.div>
                    <p className="text-black/60 text-sm font-medium">我是你的 AI 助手 Aura</p>
                    <p className="text-black/40 text-xs mt-2">有什么可以帮助你的吗？</p>
                  </motion.div>
                ) : (
                  messages.map((m, i) => (
                    <motion.div 
                      key={i} 
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: prefersReducedMotion ? 0 : Math.min(i * 0.02, 0.1),
                        duration: 0.15,
                        ease: "easeOut"
                      }}
                      style={{ 
                        willChange: 'transform, opacity',
                        backfaceVisibility: 'hidden'
                      }}
                    >
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                        m.role === 'user' 
                          ? 'bg-black text-white shadow-lg' 
                          : 'bg-white/80 text-black/80 border border-black/10'
                      }`}>
                        {m.content || <TypingIndicator />}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Retry Button */}
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
                    className="w-full py-2 text-sm text-black/60 hover:text-black bg-black/5 hover:bg-black/10 rounded-xl transition-all duration-150 border border-black/10 hover:border-black/20 focus:outline-none focus:ring-2 focus:ring-black/20"
                    aria-label="重试发送消息"
                  >
                    🔄 重试
                  </button>
                </motion.div>
              )}

              {/* Input */}
              <motion.div 
                className="px-6 pb-6 bg-gradient-to-t from-white/50 to-transparent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.12, 
                  duration: 0.15,
                  ease: "easeOut"
                }}
                style={{ willChange: 'transform, opacity' }}
              >
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                    placeholder={rateLimited ? `请等待 ${rateLimited} 秒...` : '有什么想聊的吗？'}
                    className="w-full bg-white/80 border border-black/20 rounded-2xl px-4 py-3 text-sm text-black placeholder-black/40 focus:outline-none focus:border-black/40 focus:bg-white transition-all duration-150 disabled:opacity-50 shadow-sm focus:ring-2 focus:ring-black/10"
                    disabled={isLoading || !!rateLimited}
                    aria-label="输入消息"
                  />
                  <motion.button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading || !!rateLimited}
                    className={`absolute right-2 top-2 w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 ${
                      input.trim() && !rateLimited ? 'opacity-100 hover:bg-black/80' : 'opacity-30'
                    }`}
                    whileHover={input.trim() && !rateLimited ? { 
                      scale: 1.05,
                      transition: { duration: 0.1 }
                    } : {}}
                    whileTap={input.trim() && !rateLimited ? { 
                      scale: 0.95,
                      transition: { duration: 0.05 }
                    } : {}}
                    aria-label="发送消息"
                    style={{ willChange: input.trim() && !rateLimited ? 'transform' : 'auto' }}
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