import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { usePageTransition } from '../hooks/usePageTransition';
import { useMobileOptimization } from '../hooks/useMobileOptimization';

interface MobilePageTransitionProps {
  children: ReactNode;
  className?: string;
}

const MobilePageTransition = ({ children, className = '' }: MobilePageTransitionProps) => {
  const { getPageTransition, isMobile } = usePageTransition();
  const { handleTouchStart, handleTouchEnd } = useMobileOptimization();
  const transition = getPageTransition();

  return (
    <motion.div
      {...transition}
      className={`w-full min-h-screen ${className}`}
      style={{
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        // 移动端优化
        WebkitBackfaceVisibility: 'hidden',
        WebkitTransform: 'translateZ(0)',
        // 确保页面完全覆盖，避免显示其他内容
        position: 'relative',
        zIndex: 1,
        // 移动端触摸优化
        touchAction: isMobile ? 'pan-y' : 'auto',
        // 防止选择文本时的意外行为
        WebkitUserSelect: isMobile ? 'none' : 'auto',
        userSelect: isMobile ? 'none' : 'auto'
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={(e) => handleTouchEnd(e)}
    >
      <div 
        className="w-full h-full"
        style={{
          // 确保内容区域完整覆盖
          minHeight: 'inherit',
          // 移动端滚动优化
          WebkitOverflowScrolling: isMobile ? 'touch' : 'auto'
        } as React.CSSProperties}
      >
        {children}
      </div>
    </motion.div>
  );
};

export default MobilePageTransition;