import React, { useEffect, useState } from 'react';

const ScrollIndicator: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = scrollPx / winHeightPx;
      
      setScrollProgress(scrolled);
      setIsVisible(scrollPx > 100);
    };

    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return (
    <>
      {/* 顶部进度条 */}
      <div className={`fixed top-0 left-0 h-[2px] bg-gradient-to-r from-white/20 via-white/60 to-white/20 z-[200] transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`} style={{ width: `${scrollProgress * 100}%` }}>
        <div className="absolute right-0 top-0 w-8 h-full bg-white/80 blur-sm" />
      </div>

      {/* 侧边圆形指示器 */}
      <div className={`fixed right-8 top-1/2 -translate-y-1/2 z-[100] transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
      }`}>
        <div className="relative w-12 h-12">
          {/* 背景圆环 */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="2"
              strokeDasharray={`${scrollProgress * 100}, 100`}
              className="transition-all duration-300 ease-out"
            />
          </svg>
          
          {/* 中心百分比 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white/60 tabular-nums">
              {Math.round(scrollProgress * 100)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScrollIndicator;