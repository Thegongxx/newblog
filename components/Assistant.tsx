import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ICONS } from '../constants';
import { Z_INDEX } from '../constants/zIndex';
import { askNvidiaStream } from '../services/nvidiaService';
import { Message } from '../types';
import { useIsMobile } from '../hooks/useResponsive';

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

  // 路由和移动端检测
  const location = useLocation();
  const isMobile = useIsMobile();

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

  // 优化的状态切换处理 - 苹果风格交互
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = useCallback(() => {
    // 防止动画期间的重复点击
    if (isAnimating) return;

    setIsAnimating(true);
    setIsOpen(prev => !prev);

    // 苹果标准动画时长
    setTimeout(() => {
      setIsAnimating(false);
    }, 350); // 苹果标准350ms
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

    // 监听导航栏触发的打开指令
    const handleRemoteToggle = () => handleToggle();
    window.addEventListener('aura:toggle-assistant', handleRemoteToggle);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('aura:toggle-assistant', handleRemoteToggle);
    };
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
      const context = `这是一个名为 Xx 的极简主义个人博客，专注于设计、技术和生活思考。`;
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
      {/* 苹果风格的FAB按钮 - 移动端灵动悬浮球 */}
      {true && (
        <motion.button
          onClick={handleToggle}
          disabled={isAnimating}
          className={`assistant-button fixed flex items-center justify-center border-0 focus:outline-none focus:ring-0 overflow-hidden 
            ${isMobile
              ? 'bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-2xl text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10'
              : 'bottom-8 right-8 bg-white shadow-lg text-black'
            } 
            ${isAnimating ? 'pointer-events-none' : ''}`}
          style={{
            height: isMobile ? '50px' : '56px',
            width: isOpen ? (isMobile ? '50px' : '56px') : (isMobile ? '140px' : '120px'), // 移动端展示长条形
            borderRadius: isMobile ? '25px' : '28px',
            willChange: 'transform, width',
            backfaceVisibility: 'hidden',
            zIndex: Z_INDEX.AI_ASSISTANT,
            transform: isMobile && !isOpen ? 'translateX(-50%)' : 'none', // Center confirm
          }}
          initial={false}
          animate={{
            width: isOpen ? (isMobile ? 50 : 56) : (isMobile ? 140 : 120), // 打开缩成球，关闭展开
            transform: isMobile ? 'translateX(-50%)' : 'none',
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            mass: 0.8,
            duration: 0.35,
          }}
          whileHover={!isAnimating ? {
            scale: 1.05,
            y: -2,
            boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
            transition: { type: "spring", duration: 0.2 }
          } : {}}
          whileTap={!isAnimating ? {
            scale: 0.95,
            y: 0,
            transition: { type: "spring", duration: 0.1 }
          } : {}}
          aria-label={isOpen ? "关闭AI助手" : "打开AI助手"}
          aria-expanded={isOpen}
        >
          {/* iOS 风格的黑色磨砂背景光泽 */}
          {isMobile && !isOpen && (
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          )}

          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close-icon"
                initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                className="relative flex items-center justify-center w-6 h-6"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={isMobile ? "text-white" : "text-gray-700"}>
                  <motion.path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="currentColor"
                  />
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key="open-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 px-1"
              >
                <motion.div
                  // 模拟 Siri 球体颜色
                  className={isMobile ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-xl" : "text-gray-700 text-lg"}
                >
                  {ICONS.AI}
                </motion.div>
                <span className={`font-medium text-sm tracking-wide ${isMobile ? 'text-white' : 'text-gray-800'}`}>
                  Ask Xx
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      )}

      {/* 优化的聊天面板 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 苹果风格的背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40"
              style={{
                zIndex: Z_INDEX.MODAL_BACKDROP
              }}
              onClick={handleToggle}
            />

            {/* 苹果风格的聊天面板 */}
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }}
              exit={{
                opacity: 0,
                y: 30,
                scale: 0.95
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 0.8,
                duration: 0.35
              }}
              className="fixed bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl flex flex-col overflow-hidden shadow-2xl"
              style={{
                // 移动端和桌面端不同的定位 - 固定在屏幕上
                ...(isMobile ? {
                  bottom: '7.5rem', // 避开 Bottom Bar
                  right: '1rem',
                  left: '1rem',
                  maxHeight: '70vh',
                } : {
                  bottom: '6rem',
                  right: '2rem',
                  width: '24rem',
                  maxHeight: '32rem',
                }),
                zIndex: Z_INDEX.MODAL
              }}
              role="dialog"
            >
              {/* Header - 苹果风格 */}
              <motion.div
                className="px-6 py-5 border-b border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-gray-800/50 to-gray-900/30"
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  delay: 0.1,
                  duration: 0.25
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
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      duration: 2,
                      repeat: Infinity
                    }}
                  />
                  <h3 className="text-gray-300 text-xs font-medium uppercase tracking-wider">Assistant Xx</h3>
                </div>
                {rateLimited && (
                  <motion.span
                    className="text-xs text-amber-400 bg-amber-900/30 px-2 py-1 rounded-full border border-amber-700/30"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                      duration: 0.2
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
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${m.role === 'user'
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
                    className={`absolute right-2 top-2 w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${input.trim() && !rateLimited ? 'opacity-100 hover:bg-blue-500' : 'opacity-30'
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