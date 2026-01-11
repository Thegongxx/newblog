import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { engagementApi, supabase } from '../services/supabaseService';
import { getBrowserFingerprint } from '../utils/engagement';
import { useIsMobile } from '../hooks/useResponsive';

interface LikeButtonProps {
  targetType: 'post' | 'quote' | 'homepage' | 'comment' | 'homepage_comment' | 'note';
  targetId: string;
  initialCount?: number;
  className?: string;
}

export default function LikeButton({ targetType, targetId, initialCount = 0, className = '' }: LikeButtonProps) {
  const [count, setCount] = useState<number>(initialCount);
  const [isLiked, setIsLiked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const isMobile = useIsMobile();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 苹果风格弹簧动画
  const scale = useSpring(1, { stiffness: 400, damping: 15 });
  const heartScale = useTransform(scale, [0.8, 1, 1.2], [0.9, 1, 1.15]);

  const getLikeKey = () => `aura_like_${targetType}_${targetId}_${getBrowserFingerprint()}`;

  // 初始化
  useEffect(() => {
    const init = async () => {
      try {
        const total = await engagementApi.getLikeCount(targetType, targetId);
        setCount(total);
        const key = getLikeKey();
        const localVal = parseInt(localStorage.getItem(key) || '0', 10);
        if (localVal > 0) setIsLiked(true);
        if (localVal >= 5) setLocked(true);

        const fingerprint = getBrowserFingerprint();
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase.from('likes').select('count')
          .eq('target_type', targetType).eq('target_id', targetId).eq('user_fingerprint', fingerprint)
          .gte('created_at', today).maybeSingle();
        if ((data?.count ?? 0) >= 5) setLocked(true);
      } catch { /* ignore */ }
    };
    init();
  }, [targetType, targetId]);

  // 触感反馈
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  // 点击处理
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isAnimating) return;

    const key = getLikeKey();
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    
    if (current >= 5) {
      setLocked(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      // 摇晃动画
      scale.set(1.1);
      setTimeout(() => scale.set(0.95), 50);
      setTimeout(() => scale.set(1.05), 100);
      setTimeout(() => scale.set(1), 150);
      return;
    }

    triggerHaptic();
    setIsAnimating(true);
    setIsLiked(true);
    setShowParticles(true);

    // 苹果风格按压动画
    scale.set(0.85);
    setTimeout(() => scale.set(1.15), 100);
    setTimeout(() => scale.set(1), 200);
    setTimeout(() => setShowParticles(false), 600);
    setTimeout(() => setIsAnimating(false), 300);

    // 乐观更新
    const next = current + 1;
    localStorage.setItem(key, String(next));
    setCount(c => c + 1);

    try {
      const fingerprint = getBrowserFingerprint();
      const result = await engagementApi.toggleLike(targetType, targetId, fingerprint);
      if (result?.count != null) {
        setCount(result.count);
        if (result.count >= 5) {
          setLocked(true);
          localStorage.setItem(key, '5');
        }
      }
    } catch (err: any) {
      if (err?.message?.includes('LIMIT')) {
        setLocked(true);
        localStorage.setItem(key, '5');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } else {
        localStorage.setItem(key, String(current));
        setCount(c => Math.max(0, c - 1));
      }
    }
  };

  // 粒子效果
  const particles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    angle: (i * 60) * (Math.PI / 180),
    delay: i * 0.02,
  }));

  return (
    <div className="relative inline-flex items-center">
      {/* Toast 提示 */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-50"
          >
            <div className="px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-xl text-white text-xs font-medium shadow-lg border border-white/10">
              不许这么喜欢我 💕
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={buttonRef}
        onClick={handleLike}
        style={{ scale }}
        className={`
          relative flex items-center gap-1.5 
          px-3 py-1.5 rounded-full
          bg-white/5 backdrop-blur-md
          border border-white/10
          transition-colors duration-200
          hover:bg-white/10 hover:border-white/20
          active:bg-white/15
          ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        whileTap={{ scale: 0.92 }}
        aria-label={`点赞 ${count}`}
      >
        {/* 粒子爆发效果 */}
        <AnimatePresence>
          {showParticles && particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ 
                opacity: 1, 
                scale: 0,
                x: 0,
                y: 0,
              }}
              animate={{ 
                opacity: 0,
                scale: 1,
                x: Math.cos(p.angle) * (isMobile ? 20 : 28),
                y: Math.sin(p.angle) * (isMobile ? 20 : 28),
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.5,
                delay: p.delay,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <svg 
                width={isMobile ? 8 : 10} 
                height={isMobile ? 8 : 10} 
                viewBox="0 0 24 24" 
                fill="#f43f5e"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 爱心图标 */}
        <motion.div 
          style={{ scale: heartScale }}
          className="relative"
        >
          {/* 发光效果 */}
          <AnimatePresence>
            {isLiked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.6, scale: 1.5 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 rounded-full bg-rose-500/30 blur-md"
              />
            )}
          </AnimatePresence>
          
          <motion.svg
            width={isMobile ? 16 : 18}
            height={isMobile ? 16 : 18}
            viewBox="0 0 24 24"
            className="relative z-10"
            initial={false}
            animate={{
              fill: isLiked ? '#f43f5e' : 'transparent',
              stroke: isLiked ? '#f43f5e' : 'rgba(255,255,255,0.5)',
            }}
            transition={{ duration: 0.2 }}
          >
            <motion.path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.div>

        {/* 计数器 */}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.8 }}
            transition={{ 
              type: 'spring', 
              stiffness: 500, 
              damping: 30,
            }}
            className={`
              text-xs font-medium tabular-nums
              ${isLiked ? 'text-rose-400' : 'text-white/50'}
              transition-colors duration-200
            `}
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
