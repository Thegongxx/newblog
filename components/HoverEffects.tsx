import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// Google 风格的磁性按钮效果
interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number; // 磁性强度 0-1
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({ 
  children, 
  className = "", 
  onClick, 
  strength = 0.3 
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.button>
  );
};

// 涟漪点击效果
interface RippleButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  rippleColor?: string;
}

export const RippleButton: React.FC<RippleButtonProps> = ({ 
  children, 
  className = "", 
  onClick,
  rippleColor = "rgba(255, 255, 255, 0.3)"
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    
    // 清理涟漪
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    onClick?.();
  };

  return (
    <button
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
    >
      {children}
      
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: rippleColor,
          }}
          initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
          animate={{ 
            width: 300, 
            height: 300, 
            opacity: [0.8, 0] 
          }}
          transition={{ 
            duration: 0.6, 
            ease: [0.25, 0.46, 0.45, 0.94] 
          }}
        />
      ))}
    </button>
  );
};

// 光晕悬停效果
interface GlowHoverProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: number;
}

export const GlowHover: React.FC<GlowHoverProps> = ({ 
  children, 
  className = "", 
  glowColor = "#ffffff",
  intensity = 0.2
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* 光晕背景 */}
      <motion.div
        className="absolute inset-0 rounded-inherit pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${glowColor}${Math.round(intensity * 255).toString(16).padStart(2, '0')}, transparent 70%)`,
          filter: 'blur(20px)',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.2 : 0.8
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      
      {/* 内容 */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

// 3D 倾斜效果
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export const TiltCard: React.FC<TiltCardProps> = ({ 
  children, 
  className = "", 
  maxTilt = 15 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) / rect.width;
    const deltaY = (e.clientY - centerY) / rect.height;
    
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{ 
        rotateX, 
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 1000
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};

// 浮动光标跟随效果
interface FloatingCursorProps {
  children: React.ReactNode;
  className?: string;
  cursorText?: string;
}

export const FloatingCursor: React.FC<FloatingCursorProps> = ({ 
  children, 
  className = "",
  cursorText = "点击"
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{ cursor: isHovered ? 'none' : 'auto' }}
    >
      {children}
      
      {/* 自定义光标 */}
      <motion.div
        className="absolute pointer-events-none z-50"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0,
          x: -12,
          y: -12
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <div className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          {cursorText}
        </div>
      </motion.div>
    </div>
  );
};

// 粒子爆炸效果
interface ParticleExplosionProps {
  children: React.ReactNode;
  className?: string;
  particleCount?: number;
  colors?: string[];
}

export const ParticleExplosion: React.FC<ParticleExplosionProps> = ({ 
  children, 
  className = "",
  particleCount = 20,
  colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
}) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    angle: number;
    velocity: number;
  }>>([]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = e.clientX - rect.left;
    const centerY = e.clientY - rect.top;
    
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: Date.now() + i,
      x: centerX,
      y: centerY,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: (360 / particleCount) * i,
      velocity: Math.random() * 100 + 50
    }));
    
    setParticles(prev => [...prev, ...newParticles]);
    
    // 清理粒子
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 1000);
  };

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={handleClick}>
      {children}
      
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            backgroundColor: particle.color,
            left: particle.x,
            top: particle.y,
          }}
          initial={{ 
            scale: 0,
            x: 0,
            y: 0,
            opacity: 1
          }}
          animate={{
            scale: [0, 1, 0],
            x: Math.cos(particle.angle * Math.PI / 180) * particle.velocity,
            y: Math.sin(particle.angle * Math.PI / 180) * particle.velocity,
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: 1,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        />
      ))}
    </div>
  );
};

// 呼吸光效
interface BreathingGlowProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  duration?: number;
}

export const BreathingGlow: React.FC<BreathingGlowProps> = ({ 
  children, 
  className = "",
  glowColor = "#4f46e5",
  duration = 2
}) => {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={{
        boxShadow: [
          `0 0 20px ${glowColor}40`,
          `0 0 40px ${glowColor}60`,
          `0 0 20px ${glowColor}40`
        ]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};