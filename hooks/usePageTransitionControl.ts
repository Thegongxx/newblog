import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTransitionControl = () => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'exiting' | 'entering' | 'complete'>('idle');
  const previousPath = useRef(location.pathname);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentPath = location.pathname;
    
    if (previousPath.current !== currentPath) {
      // 开始页面切换
      setIsTransitioning(true);
      setTransitionPhase('exiting');
      
      // 清除之前的定时器
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      // 阶段控制
      setTimeout(() => setTransitionPhase('entering'), 100);
      
      // 完成切换
      transitionTimeoutRef.current = setTimeout(() => {
        setTransitionPhase('complete');
        setIsTransitioning(false);
      }, 700); // 稍微长于最长动画时间
      
      previousPath.current = currentPath;
    }
    
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [location.pathname]);

  // 页面切换时的样式控制
  const getTransitionStyles = () => {
    if (!isTransitioning) return {};
    
    return {
      // 防止页面滚动
      overflow: 'hidden',
      // 确保内容不会意外显示
      position: 'relative' as const,
      // 添加轻微的背景遮罩
      '&::before': {
        content: '""',
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.01)',
        pointerEvents: 'none' as const,
        zIndex: 9998
      }
    };
  };

  return {
    isTransitioning,
    transitionPhase,
    getTransitionStyles
  };
};