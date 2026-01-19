import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagneticButton } from './HoverEffects';
import { Z_INDEX } from '../constants/zIndex';
import { useIsMobile } from '../hooks/useResponsive';

interface ScrollToTopProps {
  threshold?: number; // 显示按钮的滚动阈值
  className?: string;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ 
  threshold = 300,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / Math.max(docHeight, 1), 1);
      
      setScrollProgress(progress);
      setIsVisible(scrollTop > threshold);
    };

    // 使用 requestAnimationFrame 优化滚动性能
    let ticking = false;
    const optimizedHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedHandleScroll, { passive: true });
    return () => window.removeEventListener('scroll', optimizedHandleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 苹果风格的圆形进度指示器 - 更细分的进度
  const circumference = 2 * Math.PI * 18; // 增大半径到18
  const strokeDashoffset = circumference - (scrollProgress * circumference);
  
  // 根据进度计算颜色
  const getProgressColor = () => {
    if (scrollProgress < 0.3) return '#60a5fa'; // 蓝色开始
    if (scrollProgress < 0.6) return '#34d399'; // 绿色中间
    if (scrollProgress < 0.9) return '#fbbf24'; // 黄色接近
    return '#f87171'; // 红色完成
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed ${isMobile ? 'bottom-6 left-4' : 'bottom-8 left-8'} ${className}`}
          style={{ 
            zIndex: Z_INDEX.SCROLL_TO_TOP,
            position: 'fixed',
            pointerEvents: 'auto'
          }}
          initial={{ 
            opacity: 0, 
            scale: 0.8,
            y: 20
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: 0
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.8,
            y: 20
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            duration: 0.35
          }}
        >
          <div
            className={`
              group relative overflow-hidden
              ${isMobile ? 'w-14 h-14' : 'w-16 h-16'}
              rounded-full
              backdrop-blur-xl saturate-150
              border border-white/10
              shadow-2xl
              transition-all duration-300 ease-out
              hover:scale-105 hover:shadow-3xl
              active:scale-95
              apple-button
              cursor-pointer
              
              /* 深色模式样式 */
              bg-gray-900/60 hover:bg-gray-800/70
              
              /* 浅色模式样式 */
              [data-theme='light'] & {
                bg-white/90 hover:bg-white/95
                border-gray-300/30
                shadow-gray-400/20
              }
            `}
            onClick={scrollToTop}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* 背景光效 */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
            
            {/* 进度环背景 */}
            <svg 
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              viewBox="0 0 44 44"
            >
              {/* 背景环 */}
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/15 [data-theme='light'] &:text-gray-400/30"
              />
              
              {/* 进度环 - 细分显示 */}
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke={getProgressColor()}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 drop-shadow-sm"
                style={{
                  filter: `drop-shadow(0 0 ${isHovered ? '6px' : '3px'} ${getProgressColor()}40)`
                }}
              />
              
              {/* 进度点 */}
              {scrollProgress > 0.1 && (
                <circle
                  cx={22 + 18 * Math.cos((scrollProgress * 2 * Math.PI) - Math.PI / 2)}
                  cy={22 + 18 * Math.sin((scrollProgress * 2 * Math.PI) - Math.PI / 2)}
                  r="2"
                  fill={getProgressColor()}
                  className="animate-pulse"
                />
              )}
            </svg>

            {/* 箭头图标 */}
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <motion.svg
                width={isMobile ? "18" : "20"}
                height={isMobile ? "18" : "20"}
                viewBox="0 0 24 24"
                fill="none"
                className="text-white/90 group-hover:text-white [data-theme='light'] &:text-gray-700/90 [data-theme='light'] group-hover &:text-gray-800 transition-colors duration-300"
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                animate={{
                  y: isHovered ? [-1, 1, -1] : 0,
                }}
                transition={{
                  duration: isHovered ? 1.5 : 0.3,
                  repeat: isHovered ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                <path
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 14l5-5 5 5"
                />
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 20l5-5 5 5"
                  opacity="0.5"
                />
              </motion.svg>
            </div>

            {/* 点击涟漪效果 */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-white/20 [data-theme='light'] &:bg-gray-600/20 rounded-full scale-0"
                whileTap={{
                  scale: [0, 1.2, 0],
                  opacity: [0.8, 0.4, 0]
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              />
            </div>
          </div>

          {/* 悬停提示 */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className={`
                  absolute -top-14 left-1/2 transform -translate-x-1/2
                  px-3 py-2 rounded-lg text-xs font-medium
                  backdrop-blur-xl saturate-150
                  border border-white/10
                  shadow-lg pointer-events-none
                  whitespace-nowrap
                  
                  /* 深色模式 */
                  bg-gray-900/80 text-white/90
                  
                  /* 浅色模式 */
                  [data-theme='light'] & {
                    bg-white/90 text-gray-800/90
                    border-gray-300/20
                  }
                `}
                initial={{ opacity: 0, y: 5, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  duration: 0.2
                }}
              >
                回到顶部 ({Math.round(scrollProgress * 100)}%)
                {/* 小箭头 */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-current opacity-20" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;