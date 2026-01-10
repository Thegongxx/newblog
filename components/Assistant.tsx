import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ICONS } from '../constants';
import { askNvidiaStream } from '../services/nvidiaService';
import { Message } from '../types';

// 动画状态类型定义
interface AnimationState {
  isOpen: boolean;
  isAnimating: boolean;
  currentPhase: 'idle' | 'opening' | 'closing' | 'open' | 'closed';
  animationProgress: number;
  lastInteraction: number;
}

interface PerformanceMetrics {
  averageFPS: number;
  animationDuration: number;
  isPerformanceModeEnabled: boolean;
}

// 动画配置常量
const ANIMATION_CONFIG = {
  button: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 0.8,
    duration: 0.3
  },
  panel: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 0.8,
    duration: 0.4
  },
  overlay: {
    type: "spring" as const,
    stiffness: 500,
    damping: 35,
    mass: 0.6,
    duration: 0.3
  },
  icon: {
    duration: 0.2
  }
};

// 动画控制器类
class AnimationController {
  private state: AnimationState;
  private performanceMetrics: PerformanceMetrics;
  private animationStartTime: number = 0;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;

  constructor() {
    this.state = {
      isOpen: false,
      isAnimating: false,
      currentPhase: 'idle',
      animationProgress: 0,
      lastInteraction: 0
    };
    
    this.performanceMetrics = {
      averageFPS: 60,
      animationDuration: 0,
      isPerformanceModeEnabled: false
    };
  }

  getCurrentState(): AnimationState {
    return { ...this.state };
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  async triggerOpen(): Promise<void> {
    if (this.state.isAnimating && this.state.currentPhase === 'opening') return;
    
    this.state = {
      ...this.state,
      isOpen: true,
      isAnimating: true,
      currentPhase: 'opening',
      lastInteraction: Date.now()
    };
    
    this.startPerformanceMonitoring();
    
    // 模拟动画完成
    setTimeout(() => {
      this.state = {
        ...this.state,
        isAnimating: false,
        currentPhase: 'open'
      };
      this.stopPerformanceMonitoring();
    }, ANIMATION_CONFIG.panel.duration * 1000);
  }

  async triggerClose(): Promise<void> {
    if (this.state.isAnimating && this.state.currentPhase === 'closing') return;
    
    this.state = {
      ...this.state,
      isOpen: false,
      isAnimating: true,
      currentPhase: 'closing',
      lastInteraction: Date.now()
    };
    
    this.startPerformanceMonitoring();
    
    // 模拟动画完成
    setTimeout(() => {
      this.state = {
        ...this.state,
        isAnimating: false,
        currentPhase: 'closed'
      };
      this.stopPerformanceMonitoring();
    }, ANIMATION_CONFIG.panel.duration * 1000);
  }

  interruptAnimation(): void {
    if (this.state.isAnimating) {
      this.state = {
        ...this.state,
        isAnimating: false,
        currentPhase: this.state.isOpen ? 'open' : 'closed'
      };
      this.stopPerformanceMonitoring();
    }
  }

  enablePerformanceMode(enabled: boolean): void {
    this.performanceMetrics.isPerformanceModeEnabled = enabled;
  }

  private startPerformanceMonitoring(): void {
    this.animationStartTime = performance.now();
    this.frameCount = 0;
    this.lastFrameTime = this.animationStartTime;
  }

  private stopPerformanceMonitoring(): void {
    const endTime = performance.now();
    this.performanceMetrics.animationDuration = endTime - this.animationStartTime;
    
    if (this.frameCount > 0) {
      const totalTime = endTime - this.animationStartTime;
      this.performanceMetrics.averageFPS = (this.frameCount / totalTime) * 1000;
    }
  }

  reset(): void {
    this.state = {
      isOpen: false,
      isAnimating: false,
      currentPhase: 'idle',
      animationProgress: 0,
      lastInteraction: 0
    };
  }
}

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
  
  // 动画控制器实例
  const animationController = useMemo(() => new AnimationController(), []);
  
  // 性能监控状态
  const [performanceMode, setPerformanceMode] = useState(false);

  // 优化的动画配置 - 根据可访问性设置调整
  const getAnimationConfig = useCallback((configType: keyof typeof ANIMATION_CONFIG) => {
    const baseConfig = ANIMATION_CONFIG[configType];
    
    if (prefersReducedMotion || performanceMode) {
      if ('stiffness' in baseConfig) {
        return {
          ...baseConfig,
          duration: baseConfig.duration * 0.5, // 减少动画时间
          stiffness: baseConfig.stiffness * 2
        };
      } else {
        return {
          ...baseConfig,
          duration: baseConfig.duration * 0.5
        };
      }
    }
    
    return baseConfig;
  }, [prefersReducedMotion, performanceMode]);

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

  // 优化的状态切换处理
  const handleToggle = useCallback(async () => {
    try {
      if (isOpen) {
        await animationController.triggerClose();
        setIsOpen(false);
      } else {
        await animationController.triggerOpen();
        setIsOpen(true);
      }
    } catch (error) {
      console.warn('Animation error:', error);
      // 错误恢复 - 直接设置状态
      setIsOpen(!isOpen);
      animationController.reset();
    }
  }, [isOpen, animationController]);

  // 性能监控
  useEffect(() => {
    const checkPerformance = () => {
      const metrics = animationController.getPerformanceMetrics();
      if (metrics.averageFPS < 30) {
        setPerformanceMode(true);
        animationController.enablePerformanceMode(true);
      }
    };

    const interval = setInterval(checkPerformance, 5000);
    return () => clearInterval(interval);
  }, [animationController]);

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

  // 资源清理
  useEffect(() => {
    return () => {
      animationController.interruptAnimation();
    };
  }, [animationController]);

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
      {/* 优化的浮动按钮 */}
      <motion.button
        onClick={handleToggle}
        className="fixed bottom-8 right-8 z-50 flex items-center justify-center bg-white/95 backdrop-blur-xl text-black shadow-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-black/20 focus:ring-offset-2
                   max-sm:bottom-6 max-sm:right-6 max-sm:scale-90"
        style={{
          height: '56px',
          borderRadius: '28px',
          willChange: 'transform, width, padding', // GPU优化
        }}
        animate={{
          width: isOpen ? 56 : 'auto',
          paddingLeft: isOpen ? 0 : 24,
          paddingRight: isOpen ? 0 : 24,
        }}
        transition={getAnimationConfig('button')}
        whileHover={{ 
          scale: isTouchDevice ? 1 : 1.05,
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          transition: { duration: 0.2 }
        }}
        whileTap={{ 
          scale: isTouchDevice ? 0.9 : 0.95,
          transition: { duration: 0.1 }
        }}
        aria-label={isOpen ? "关闭AI助手" : "打开AI助手"}
        aria-expanded={isOpen}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={getAnimationConfig('icon')}
              className="text-2xl font-light text-black/80"
            >
              ×
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={getAnimationConfig('icon')}
              className="flex items-center gap-3"
            >
              <motion.span 
                className="text-black/70 text-lg"
                animate={prefersReducedMotion ? {} : { 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={prefersReducedMotion ? {} : { 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatDelay: 3 
                }}
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
            {/* 背景遮罩 - 优化的模糊效果 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={getAnimationConfig('overlay')}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
              style={{ willChange: 'opacity' }} // GPU优化
              onClick={handleToggle}
              aria-label="点击关闭AI助手"
            />
            
            {/* 聊天面板 - 增强的3D效果 */}
            <motion.div
              initial={{ 
                opacity: 0, 
                y: 40, 
                scale: 0.9,
                rotateX: -15
              }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                rotateX: 0
              }}
              exit={{ 
                opacity: 0, 
                y: 40, 
                scale: 0.9,
                rotateX: -15
              }}
              transition={getAnimationConfig('panel')}
              className="fixed bottom-28 right-8 z-40 w-96 max-w-[calc(100vw-2rem)] max-h-[32rem] bg-white/95 backdrop-blur-xl border border-white/30 rounded-3xl flex flex-col overflow-hidden shadow-2xl
                         sm:w-96 sm:bottom-28 sm:right-8
                         max-sm:w-[calc(100vw-1rem)] max-sm:bottom-24 max-sm:right-2 max-sm:left-2 max-sm:mx-auto max-sm:max-h-[70vh]"
              style={{
                boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)',
                willChange: 'transform, opacity', // GPU优化
                transformStyle: 'preserve-3d' // 3D效果
              }}
              role="dialog"
              aria-label="AI助手聊天面板"
              aria-modal="true"
            >
              {/* Header - 增强的白色主题 */}
              <motion.div 
                className="px-6 py-5 border-b border-black/10 flex items-center justify-between bg-gradient-to-r from-white/50 to-white/30"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, ...getAnimationConfig('icon') }}
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
                  />
                  <h3 className="text-black/70 text-xs font-bold uppercase tracking-wider">Assistant Aura</h3>
                </div>
                {rateLimited && (
                  <motion.span 
                    className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={getAnimationConfig('icon')}
                  >
                    冷却中 {rateLimited}s
                  </motion.span>
                )}
                {performanceMode && (
                  <motion.span 
                    className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    title="性能优化模式已启用"
                  >
                    ⚡
                  </motion.span>
                )}
              </motion.div>

              {/* Messages - 优化的消息显示 */}
              <div 
                ref={scrollRef} 
                className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-white/20 to-white/10"
                style={{ willChange: 'scroll-position' }} // 滚动优化
              >
                {messages.length === 0 ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, ...getAnimationConfig('icon') }}
                  >
                    <motion.div 
                      className="text-black/30 mb-4 text-2xl"
                      animate={prefersReducedMotion ? {} : { 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={prefersReducedMotion ? {} : { 
                        duration: 3, 
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
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
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: prefersReducedMotion ? 0 : i * 0.05,
                        ...getAnimationConfig('icon')
                      }}
                      style={{ willChange: 'transform, opacity' }} // GPU优化
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

              {/* Retry Button - 增强的白色主题 */}
              {retryInfo.show && !isLoading && (
                <motion.div 
                  className="px-6 pb-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={getAnimationConfig('icon')}
                  style={{ willChange: 'height, opacity' }} // GPU优化
                >
                  <button
                    onClick={handleRetry}
                    className="w-full py-2 text-sm text-black/60 hover:text-black bg-black/5 hover:bg-black/10 rounded-xl transition-all duration-200 border border-black/10 hover:border-black/20 focus:outline-none focus:ring-2 focus:ring-black/20"
                    aria-label="重试发送消息"
                  >
                    🔄 重试
                  </button>
                </motion.div>
              )}

              {/* Input - 增强的白色主题 */}
              <motion.div 
                className="px-6 pb-6 bg-gradient-to-t from-white/50 to-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, ...getAnimationConfig('icon') }}
              >
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                    placeholder={rateLimited ? `请等待 ${rateLimited} 秒...` : '有什么想聊的吗？'}
                    className="w-full bg-white/80 border border-black/20 rounded-2xl px-4 py-3 text-sm text-black placeholder-black/40 focus:outline-none focus:border-black/40 focus:bg-white transition-all duration-200 disabled:opacity-50 shadow-sm focus:ring-2 focus:ring-black/10"
                    disabled={isLoading || !!rateLimited}
                    aria-label="输入消息"
                  />
                  <motion.button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading || !!rateLimited}
                    className={`absolute right-2 top-2 w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 ${
                      input.trim() && !rateLimited ? 'opacity-100 hover:bg-black/80' : 'opacity-30'
                    }`}
                    whileHover={input.trim() && !rateLimited ? { scale: 1.05 } : {}}
                    whileTap={input.trim() && !rateLimited ? { scale: 0.95 } : {}}
                    aria-label="发送消息"
                    style={{ willChange: 'transform' }} // GPU优化
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
