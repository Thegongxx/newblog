import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { engagementApi, supabase } from '../services/supabaseService';
import { getBrowserFingerprint, checkIfLikedLocal, setLikedLocal } from '../utils/engagement';
import { useIsMobile } from '../hooks/useResponsive';

interface LikeButtonProps {
    targetType: 'post' | 'quote' | 'homepage' | 'comment' | 'homepage_comment' | 'note';
    targetId: string;
    initialCount?: number;
    className?: string;
}

export default function LikeButton({ targetType, targetId, initialCount = 0, className = "" }: LikeButtonProps) {
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(initialCount);
    const [isAnimating, setIsAnimating] = useState(false);
    const [locked, setLocked] = useState(false);
    const [dailyCount, setDailyCount] = useState(0);
    const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'success' | 'warning' | 'info' }>({ 
        message: '', 
        visible: false, 
        type: 'success' 
    });
    
    const isMobile = useIsMobile();

    // 持久化存储 Key
    const getStorageKey = () => `aura_like_limit_${targetType}_${targetId}_${new Date().toISOString().split('T')[0]}`;

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                // 获取总数
                const total = await engagementApi.getLikeCount(targetType, targetId);
                setCount(total);
                const isLiked = checkIfLikedLocal(targetType, targetId);
                setLiked(isLiked);

                // 检查本地持久化锁定
                const localCount = parseInt(localStorage.getItem(getStorageKey()) || '0');
                setDailyCount(localCount);
                if (localCount >= 5) {
                    setLocked(true);
                }

                // 后端双重校验
                const fingerprint = getBrowserFingerprint();
                const today = new Date().toISOString().split('T')[0];
                const { data } = await supabase
                    .from('likes')
                    .select('count')
                    .eq('target_type', targetType)
                    .eq('target_id', targetId)
                    .eq('user_fingerprint', fingerprint)
                    .gte('created_at', today);

                const dbCount = data?.reduce((acc, curr) => acc + (curr.count || 0), 0) || 0;
                if (dbCount >= 5) {
                    setLocked(true);
                    setDailyCount(dbCount);
                    localStorage.setItem(getStorageKey(), dbCount.toString());
                }
            } catch (err) {
                console.error('Failed to fetch initial like data:', err);
            }
        };
        fetchInitial();
    }, [targetType, targetId]);

    const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
        setToast({ message, visible: true, type });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2500);
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();

        // 防止动画期间重复点击
        if (isAnimating) return;

        if (locked) {
            showToast(`今日已点赞 ${dailyCount}/5 次`, 'warning');
            return;
        }

        // 立即计算新的本地计数
        const currentLocal = parseInt(localStorage.getItem(getStorageKey()) || '0');
        if (currentLocal >= 5) {
            setLocked(true);
            showToast(`今日已点赞 ${currentLocal}/5 次`, 'warning');
            return;
        }

        // 开始动画
        setIsAnimating(true);
        
        // UI 立即增加反馈
        setCount(prev => prev + 1);
        const nextLocal = currentLocal + 1;
        setDailyCount(nextLocal);
        localStorage.setItem(getStorageKey(), nextLocal.toString());

        if (nextLocal >= 5) {
            setLocked(true);
            showToast(`今日点赞已达上限`, 'info');
        } else {
            showToast(`点赞成功！还可点赞 ${5 - nextLocal} 次`, 'success');
        }

        // 触发物理反馈
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([10, 50, 10]);
        }

        // 动画完成后重置状态
        setTimeout(() => {
            setIsAnimating(false);
        }, 800);

        // 后端同步
        try {
            const fingerprint = getBrowserFingerprint();
            const result = await engagementApi.toggleLike(targetType, targetId, fingerprint);
            setLiked(true);
            setLikedLocal(targetType, targetId, true);

            if (result.count >= 5) {
                setLocked(true);
                setDailyCount(5);
                localStorage.setItem(getStorageKey(), '5');
            }
        } catch (err: any) {
            if (err.message === 'DAILY_LIMIT_REACHED') {
                setLocked(true);
                setDailyCount(5);
                localStorage.setItem(getStorageKey(), '5');
                showToast('今日点赞已达上限', 'warning');
            } else {
                console.error('Failed to toggle like:', err);
                setCount(prev => prev - 1);
                setDailyCount(currentLocal);
                localStorage.setItem(getStorageKey(), currentLocal.toString());
                showToast('点赞失败，请稍后重试', 'warning');
            }
        }
    };

    return (
        <div className="relative inline-block">
            {/* Google风格的灵动岛透明提示 */}
            <AnimatePresence>
                {toast.visible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -10 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            mass: 0.8
                        }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
                        style={{
                            position: 'fixed',
                            top: isMobile ? '1.5rem' : '2rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 9999
                        }}
                    >
                        <div className={`px-6 py-3 rounded-full backdrop-blur-2xl border shadow-2xl text-sm font-medium whitespace-nowrap ${
                            toast.type === 'success' ? 'bg-black/80 border-white/20 text-white' :
                            toast.type === 'warning' ? 'bg-amber-500/90 border-amber-400/50 text-white' :
                            'bg-blue-500/90 border-blue-400/50 text-white'
                        }`}
                        style={{
                            backdropFilter: 'blur(20px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        }}>
                            <div className="flex items-center gap-2">
                                <motion.div
                                    className={`w-2 h-2 rounded-full ${
                                        toast.type === 'success' ? 'bg-green-400' : 
                                        toast.type === 'warning' ? 'bg-amber-300' : 'bg-blue-300'
                                    }`}
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                                <span>{toast.message}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Google风格的点赞按钮 - 带计数 */}
            <motion.button
                onClick={handleLike}
                disabled={isAnimating}
                className={`group relative flex items-center gap-2 ${
                    isMobile ? 'px-2 py-1' : 'px-3 py-2'
                } rounded-full transition-all duration-200 overflow-hidden ${
                    locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                    liked
                        ? 'bg-rose-50/10 text-rose-400'
                        : 'bg-white/5 text-white/50 hover:text-white/70 hover:bg-white/10'
                } ${className}`}
                whileHover={!locked && !isAnimating ? {
                    scale: 1.05,
                    transition: { duration: 0.15, ease: [0.4, 0.0, 0.2, 1] }
                } : {}}
                whileTap={!locked && !isAnimating ? {
                    scale: 0.95,
                    transition: { duration: 0.1, ease: [0.4, 0.0, 0.2, 1] }
                } : {}}
                aria-label={locked ? `今日已点赞 ${dailyCount}/5 次` : `点赞 (${count})`}
            >
                {/* Ripple效果 */}
                {!locked && (
                    <motion.div
                        className="absolute inset-0 bg-white/10 rounded-full"
                        initial={{ scale: 0, opacity: 0 }}
                        whileTap={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    />
                )}

                {/* 爱心图标 */}
                <motion.svg
                    className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} transition-all duration-200 ${
                        liked ? 'fill-current scale-110' : 'fill-none scale-100'
                    }`}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={isAnimating ? {
                        scale: [1, 1.3, 1],
                        rotate: [0, -10, 10, 0]
                    } : {}}
                    transition={{
                        duration: 0.6,
                        ease: [0.4, 0.0, 0.2, 1]
                    }}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </motion.svg>

                {/* 计数显示 */}
                <motion.span 
                    className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium tabular-nums`}
                    animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                >
                    {count}
                </motion.span>

                {/* Google风格的微妙粒子效果 */}
                {!locked && isAnimating && (
                    <div className="absolute inset-0 pointer-events-none">
                        {/* 微妙的圆形粒子 */}
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={`particle-${i}`}
                                className="absolute left-1/2 top-1/2 w-1 h-1 bg-rose-400/60 rounded-full"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: [0, 1, 0],
                                    opacity: [0, 0.8, 0],
                                    x: Math.cos((i * 45) * Math.PI / 180) * (12 + Math.random() * 8),
                                    y: Math.sin((i * 45) * Math.PI / 180) * (12 + Math.random() * 8),
                                }}
                                transition={{
                                    duration: 0.6,
                                    ease: [0.4, 0.0, 0.2, 1],
                                    delay: Math.random() * 0.1
                                }}
                            />
                        ))}

                        {/* 更微妙的光点 */}
                        {[...Array(4)].map((_, i) => (
                            <motion.div
                                key={`glow-${i}`}
                                className="absolute left-1/2 top-1/2 w-0.5 h-0.5 bg-white/80 rounded-full"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: [0, 1.5, 0],
                                    opacity: [0, 1, 0],
                                    x: Math.cos((i * 90) * Math.PI / 180) * 8,
                                    y: Math.sin((i * 90) * Math.PI / 180) * 8,
                                }}
                                transition={{
                                    duration: 0.4,
                                    ease: [0.4, 0.0, 0.2, 1],
                                    delay: 0.1
                                }}
                            />
                        ))}

                        {/* 中心扩散圆环 */}
                        <motion.div
                            className="absolute left-1/2 top-1/2 border border-rose-400/30 rounded-full"
                            initial={{ scale: 0, opacity: 0.8 }}
                            animate={{ scale: 3, opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
                            style={{
                                width: '8px',
                                height: '8px',
                                marginLeft: '-4px',
                                marginTop: '-4px'
                            }}
                        />
                    </div>
                )}
            </motion.button>
        </div>
    );
}
