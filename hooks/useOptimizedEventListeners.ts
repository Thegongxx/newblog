import { useEffect, useCallback, useRef } from 'react';

// 节流函数
const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

// 防抖函数
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

interface UseOptimizedEventListenersProps {
  onScroll?: (scrolled: boolean) => void;
  onMouseMove?: (x: number, y: number) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
}

export const useOptimizedEventListeners = ({
  onScroll,
  onMouseMove,
  onKeyDown
}: UseOptimizedEventListenersProps) => {
  const rafId = useRef<number>();
  
  // 优化滚动处理
  const handleScroll = useCallback(
    throttle(() => {
      if (onScroll) {
        onScroll(window.scrollY > 30);
      }
    }, 16), // 60fps
    [onScroll]
  );

  // 优化鼠标移动处理
  const handleMouseMove = useCallback(
    throttle((e: MouseEvent) => {
      if (onMouseMove) {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        onMouseMove(x, y);
      }
    }, 16), // 60fps
    [onMouseMove]
  );

  // 键盘事件不需要节流
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    onKeyDown?.(e);
  }, [onKeyDown]);

  useEffect(() => {
    if (onScroll) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    if (onMouseMove) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }
    
    if (onKeyDown) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleScroll, handleMouseMove, handleKeyDown, onScroll, onMouseMove, onKeyDown]);
};

export { throttle, debounce };