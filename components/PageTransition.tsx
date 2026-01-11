import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { usePageTransition } from '../hooks/usePageTransition';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
  const { getPageTransition } = usePageTransition();
  const transition = getPageTransition();

  return (
    <motion.div
      {...transition}
      className={`w-full min-h-screen ${className}`}
      style={{
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        // 确保页面完全覆盖，避免显示其他内容
        position: 'relative',
        zIndex: 1,
        // 确保在动画过程中有背景色
        backgroundColor: 'transparent'
      }}
    >
      <div 
        className="w-full h-full"
        style={{
          // 确保内容区域完整覆盖
          minHeight: 'inherit'
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};

export default PageTransition;