import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTransitionControl = () => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousPath = useRef(location.pathname);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentPath = location.pathname;
    
    if (previousPath.current !== currentPath) {
      // 开始页面切换
      setIsTransitioning(true);
      
      // 清除之前的定时器
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      // 完成切换
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 500); // 与最长动画时间匹配
      
      previousPath.current = currentPath;
    }
    
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [location.pathname]);

  return {
    isTransitioning
  };
};