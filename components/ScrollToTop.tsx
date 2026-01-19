import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Z_INDEX } from '../constants/zIndex';
import { useIsMobile } from '../hooks/useResponsive';
import { MOBILE_NAV_CONFIG } from '../constants/mobileNavigation';

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

  // 苹果风格的圆形进度指示器
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (scrollProgress * circumference);
  
  // 根据进度计算颜色
  const getProgressColor = () => {
    if (scrollProgress < 0.3) return '#60a5fa';
    if (scrollProgress < 0.6) return '#34d399';
    if (scrollProgress < 0.9) return '#fbbf24';
    return '#f87171';
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
          <motion.div
            className={`
              group relative overflow-hidden cursor-pointer
              ${isMobile ? 'w-14 h-14' : 'w-16 h-16'}
              rounded-full
              transition-all duration-300 ease-out
              ${!isMobile ? 'hover:scale-105 hover:shadow-3xl' : ''}
              active:scale-95
            `}
            style={isMobile ? {
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: `blur(${MOBILE_NAV_CONFIG.VISUAL.BACKDROP_BLUR}px) saturate(180%)`,
              boxShadow: `0 4px 20px rgba(0,0,0,${MOBILE_NAV_CONFIG.VISUAL.SHADOW_OPACITY}), 0 0 0 ${MOBILE_NAV_CONFIG.VISUAL.BORDER_WIDTH}px rgba(255,255,255,${MOBILE_NAV_CONFIG.VISUAL.BORDER_OPACITY})`,
              borderWidth: `${MOBILE_NAV_CONFIG.VISUAL.BORDER_WIDTH}px`,
              borderStyle: 'solid',
              borderColor: `rgba(255, 255, 255, ${MOBILE_NAV_CONFIG.VISUAL.BORDER_OPACITY})`,
            } : {
              backdropFilter: 'blur(20px) saturate(150%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              backgroundColor: 'rgba(31, 41, 55, 0.6)',
            }}
            onClick={scrollToTop}
            onMouseEnter={() => !isMobile && setIsHovered(true)}
            onMouseLeave={() => !isMobile && setIsHovered(false)}
            whileHover={!isMobile ? { scale: 1.05 } : {}}
            whileTap={{ scale: 0.95 }}
          >
            {/* 背景光效 - 仅PC端 */}
            {!isMobile && (
              <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
            )}
            
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
                className="text-white/15"
              />
              
              {/* 进度环 - 当滚动进度超过0.15时显示 */}
              {scrollProgress > 0.15 && (
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
              )}
            </svg>

            {/* 箭头图标 */}
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <motion.svg
                width={isMobile ? "18" : "20"}
                height={isMobile ? "18" : "20"}
                viewBox="0 0 24 24"
                fill="none"
                className="text-white/90 transition-colors duration-300"
                whileHover={!isMobile ? { y: -1 } : {}}
                whileTap={{ y: 0 }}
                animate={!isMobile ? {
                  y: isHovered ? [-1, 1, -1] : 0,
                } : {}}
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

            {/* 点击涟漪效果 - 仅PC端 */}
            {!isMobile && (
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-full scale-0"
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
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;