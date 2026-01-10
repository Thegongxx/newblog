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
        // 只显示上限提示，使用简洁的消息
        setToast({ message, visible: true, type });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), isMobile ? 1500 : 2000);
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();

        // 防止动画期间重复点击
        if (isAnimating) return;

        if (locked) {
            showToast(`❤️ 不许这么喜欢我 `, 'warning');
            return;
        }

        // 立即计算新的本地计数
        const currentLocal = parseInt(localStorage.getItem(getStorageKey()) || '0');
        if (currentLocal >= 5) {
            setLocked(true);
            showToast(`❤️ 不许这么喜欢我`, 'warning');
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
            showToast(`❤️ 不许这么喜欢我`, 'warning');
        }
        // 移除点赞成功提示，只保留上限提示

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
                showToast('❤️ Daily limit', 'warning');
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
            {/* 智能定位的透明灵动岛提示 */}
            <AnimatePresence>
                {toast.visible && (
                    <motion.div
                        initial={{ 
                            opacity: 0, 
                            scale: 0.8, 
                            x: -10,
                            y: 5
                        }}
                        animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            x: 0,
                            y: 0
                        }}
                        exit={{ 
                            opacity: 0, 
                            scale: 0.8, 
                            x: -5,
                            y: 2
                        }}
                        transition={{
                            type: "spring",
                            stiffness: isMobile ? 250 : 300,
                            damping: isMobile ? 25 : 30,
                            mass: 0.8,
                            duration: isMobile ? 0.5 : 0.6
                        }}
                        className="absolute z-[9999] pointer-events-none"
                        style={{
                            // 定位在点赞按钮的左上方
                            top: isMobile ? '-40px' : '-45px',
                            left: isMobile ? '-60px' : '-80px',
                            minWidth: 'max-content', // 防止文字换行
                        }}
                    >
                        <motion.div 
                            className={`relative overflow-hidden ${
                                isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'
                            } font-medium whitespace-nowrap text-white/90`}
                            style={{
                                borderRadius: isMobile ? '14px' : '20px',
                                background: 'rgba(0, 0, 0, 0.9)', // 增强背景不透明度
                                backdropFilter: isMobile ? 'blur(20px) saturate(150%)' : 'blur(24px) saturate(160%)',
                                WebkitBackdropFilter: isMobile ? 'blur(20px) saturate(150%)' : 'blur(24px) saturate(160%)',
                                boxShadow: isMobile 
                                    ? '0 6px 25px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                                    : '0 10px 40px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.15)',
                                border: isMobile ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.25)'
                            }}
                            animate={{
                                // 微妙的浮动效果
                                y: isMobile ? [0, -1, 0] : [0, -2, 0],
                            }}
                            transition={{
                                duration: isMobile ? 2.5 : 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            {/* 透明背景光晕 */}
                            <div 
                                className={`absolute inset-0 ${isMobile ? 'opacity-8' : 'opacity-12'}`}
                                style={{
                                    background: toast.type === 'success' 
                                        ? 'radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, transparent 70%)'
                                        : toast.type === 'warning'
                                        ? 'radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, transparent 70%)'
                                        : 'radial-gradient(circle at center, rgba(255, 255, 255, 0.18) 0%, transparent 70%)'
                                }}
                            />
                            
                            <div className="relative flex items-center gap-2">
                                {/* 状态指示器 */}
                                <motion.div
                                    className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full ${
                                        toast.type === 'success' ? 'bg-white/80' : 
                                        toast.type === 'warning' ? 'bg-white/60' : 'bg-white/70'
                                    }`}
                                    animate={{ 
                                        scale: isMobile ? [1, 1.1, 1] : [1, 1.2, 1],
                                        opacity: [0.8, 1, 0.8]
                                    }}
                                    transition={{ 
                                        duration: isMobile ? 1.5 : 2, 
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                                
                                {/* 消息文本 */}
                                <motion.span
                                    initial={{ opacity: 0, x: -3 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1, duration: 0.3 }}
                                    className="font-medium text-white/95"
                                >
                                    {toast.message}
                                </motion.span>
                            </div>
                            
                            {/* 底部透明进度条 */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-0.5 bg-white/30 rounded-full"
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: isMobile ? 1.5 : 2, ease: "linear" }}
                            />

                            {/* 指向点赞按钮的小箭头 */}
                            <div 
                                className="absolute"
                                style={{
                                    right: isMobile ? '-4px' : '-6px',
                                    bottom: isMobile ? '8px' : '10px',
                                    width: 0,
                                    height: 0,
                                    borderLeft: isMobile ? '4px solid rgba(0, 0, 0, 0.9)' : '6px solid rgba(0, 0, 0, 0.9)',
                                    borderTop: isMobile ? '4px solid transparent' : '6px solid transparent',
                                    borderBottom: isMobile ? '4px solid transparent' : '6px solid transparent',
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 苹果风格的点赞按钮 - 移动端简化 */}
            <motion.button
                onClick={handleLike}
                disabled={isAnimating}
                className={`group relative flex items-center gap-2 ${
                    isMobile ? 'px-2 py-1.5' : 'px-3 py-2'
                } rounded-full transition-all duration-200 overflow-hidden ${
                    locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                    liked
                        ? 'bg-rose-50/10 text-rose-400'
                        : 'bg-white/5 text-white/50 hover:text-white/70 hover:bg-white/10'
                } ${className}`}
                whileHover={!locked && !isAnimating ? {
                    scale: isMobile ? 1.02 : 1.05,
                    transition: { duration: 0.15, ease: [0.4, 0.0, 0.2, 1] }
                } : {}}
                whileTap={!locked && !isAnimating ? {
                    scale: isMobile ? 0.98 : 0.95,
                    transition: { duration: 0.1, ease: [0.4, 0.0, 0.2, 1] }
                } : {}}
                style={{
                    backdropFilter: isMobile ? 'blur(8px)' : 'blur(12px)',
                    WebkitBackdropFilter: isMobile ? 'blur(8px)' : 'blur(12px)',
                }}
                aria-label={locked ? `今日已点赞 ${dailyCount}/5 次` : `点赞 (${count})`}
            >
                {/* 苹果风格的 Ripple 效果 */}
                {!locked && (
                    <motion.div
                        className="absolute inset-0 bg-white/10 rounded-full"
                        initial={{ scale: 0, opacity: 0 }}
                        whileTap={{ 
                            scale: isMobile ? 1.5 : 2, 
                            opacity: [0, 0.3, 0] 
                        }}
                        transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
                    />
                )}

                {/* 爱心图标 - 移动端简化 */}
                <motion.svg
                    className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} transition-all duration-200 ${
                        liked ? 'fill-current scale-110' : 'fill-none scale-100'
                    }`}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={isAnimating ? {
                        scale: isMobile ? [1, 1.2, 1] : [1, 1.3, 1],
                        rotate: [0, -8, 8, 0]
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

                {/* 计数显示 - 移动端简化 */}
                <motion.span 
                    className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium tabular-nums`}
                    animate={isAnimating ? { 
                        scale: isMobile ? [1, 1.15, 1] : [1, 1.2, 1] 
                    } : {}}
                    transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                >
                    {count}
                </motion.span>

                {/* 苹果风格的微妙粒子效果 - 移动端简化 */}
                {!locked && isAnimating && (
                    <div className="absolute inset-0 pointer-events-none">
                        {/* 主要粒子 - 移动端减少数量 */}
                        {[...Array(isMobile ? 4 : 6)].map((_, i) => (
                            <motion.div
                                key={`particle-${i}`}
                                className={`absolute left-1/2 top-1/2 ${
                                    isMobile ? 'w-0.5 h-0.5' : 'w-1 h-1'
                                } bg-rose-400/70 rounded-full`}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: [0, 1, 0],
                                    opacity: [0, 0.9, 0],
                                    x: Math.cos((i * 60) * Math.PI / 180) * (isMobile ? 8 : 12),
                                    y: Math.sin((i * 60) * Math.PI / 180) * (isMobile ? 8 : 12),
                                }}
                                transition={{
                                    duration: 0.5,
                                    ease: [0.4, 0.0, 0.2, 1],
                                    delay: Math.random() * 0.1
                                }}
                            />
                        ))}

                        {/* 光点效果 - 移动端简化 */}
                        {!isMobile && [...Array(3)].map((_, i) => (
                            <motion.div
                                key={`glow-${i}`}
                                className="absolute left-1/2 top-1/2 w-0.5 h-0.5 bg-white/90 rounded-full"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: [0, 1.5, 0],
                                    opacity: [0, 1, 0],
                                    x: Math.cos((i * 120) * Math.PI / 180) * 6,
                                    y: Math.sin((i * 120) * Math.PI / 180) * 6,
                                }}
                                transition={{
                                    duration: 0.4,
                                    ease: [0.4, 0.0, 0.2, 1],
                                    delay: 0.1
                                }}
                            />
                        ))}

                        {/* 中心扩散圆环 - 苹果风格 */}
                        <motion.div
                            className="absolute left-1/2 top-1/2 border border-rose-400/40 rounded-full"
                            initial={{ scale: 0, opacity: 0.9 }}
                            animate={{ 
                                scale: isMobile ? 2.5 : 3, 
                                opacity: 0 
                            }}
                            transition={{ 
                                duration: 0.5, 
                                ease: [0.4, 0.0, 0.2, 1] 
                            }}
                            style={{
                                width: isMobile ? '6px' : '8px',
                                height: isMobile ? '6px' : '8px',
                                marginLeft: isMobile ? '-3px' : '-4px',
                                marginTop: isMobile ? '-3px' : '-4px'
                            }}
                        />
                    </div>
                )}
            </motion.button>
        </div>
    );
}
