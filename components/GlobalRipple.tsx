import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Z_INDEX } from '../constants/zIndex';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const GlobalRipple: React.FC = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // 只在非触摸设备上显示涟漪效果
      if (window.matchMedia('(hover: hover)').matches) {
        const newRipple: Ripple = {
          id: Date.now(),
          x: e.clientX,
          y: e.clientY,
        };

        setRipples(prev => [...prev, newRipple]);

        // 清理涟漪
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
        }, 800);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: Z_INDEX.RIPPLE }}
    >
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full bg-white/20 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
            initial={{ 
              width: 0, 
              height: 0, 
              x: '-50%', 
              y: '-50%',
              opacity: 0.8
            }}
            animate={{ 
              width: 100, 
              height: 100,
              opacity: 0
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: [0.25, 0.46, 0.45, 0.94] 
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default GlobalRipple;