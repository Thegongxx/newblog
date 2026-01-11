import { useEffect, useRef } from 'react';
import { useIsMobile } from './useResponsive';

export const useMobileOptimization = () => {
  const isMobile = useIsMobile();
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    if (!isMobile) return;

    // 优化移动端滚动性能
    const optimizeScrolling = () => {
      // 启用硬件加速
      document.body.style.transform = 'translateZ(0)';
      document.body.style.backfaceVisibility = 'hidden';
      
      // 优化触摸滚动 - 使用类型断言
      (document.body.style as any).webkitOverflowScrolling = 'touch';
    };

    // 防止双击缩放
    const preventDoubleClickZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // 优化触摸延迟
    const optimizeTouchDelay = () => {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
      
      const existingMeta = document.querySelector('meta[name="viewport"]');
      if (existingMeta) {
        existingMeta.replaceWith(meta);
      } else {
        document.head.appendChild(meta);
      }
    };

    // 触摸反馈
    const addTouchFeedback = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, [role="button"], a, .cursor-pointer')) {
        // 添加触摸反馈
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
        
        // 视觉反馈
        target.style.transform = 'scale(0.98)';
        target.style.transition = 'transform 0.1s ease';
        
        setTimeout(() => {
          target.style.transform = '';
          target.style.transition = '';
        }, 100);
      }
    };

    optimizeScrolling();
    optimizeTouchDelay();

    // 添加事件监听器
    document.addEventListener('touchstart', preventDoubleClickZoom, { passive: false });
    document.addEventListener('touchstart', addTouchFeedback, { passive: true });

    return () => {
      document.removeEventListener('touchstart', preventDoubleClickZoom);
      document.removeEventListener('touchstart', addTouchFeedback);
    };
  }, [isMobile]);

  // 触摸手势检测
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e: React.TouchEvent, onSwipeLeft?: () => void, onSwipeRight?: () => void) => {
    if (!isMobile || !touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // 检测快速滑动手势
    const isSwipe = Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100 && deltaTime < 300;

    if (isSwipe) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    touchStartRef.current = null;
  };

  return {
    isMobile,
    handleTouchStart,
    handleTouchEnd
  };
};