import React, { useRef, useEffect, useState } from 'react';

interface GestureEnhancedProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
}

const GestureEnhanced: React.FC<GestureEnhancedProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = ''
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setIsPressed(true);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      
      const minSwipeDistance = 50;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        }
      } else {
        // 垂直滑动
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }
      
      setTouchStart(null);
      setIsPressed(false);
    };

    const handleMouseDown = (e: MouseEvent) => {
      setTouchStart({ x: e.clientX, y: e.clientY });
      setIsPressed(true);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!touchStart) return;
      
      const deltaX = e.clientX - touchStart.x;
      const deltaY = e.clientY - touchStart.y;
      
      const minSwipeDistance = 100;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        }
      } else {
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }
      
      setTouchStart(null);
      setIsPressed(false);
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
    };
  }, [touchStart, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return (
    <div 
      ref={elementRef}
      className={`transition-all duration-200 ${
        isPressed ? 'scale-[0.98] brightness-95' : 'scale-100 brightness-100'
      } ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      {children}
    </div>
  );
};

export default GestureEnhanced;