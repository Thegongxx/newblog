import React, { useState, useEffect, useRef } from 'react';
import { engagementApi, supabase } from '../services/supabaseService';
import { getBrowserFingerprint, checkIfLikedLocal, setLikedLocal } from '../utils/engagement';
import { useIsMobile } from '../hooks/useResponsive';
import { Z_INDEX } from '../constants/zIndex';

interface LikeButtonProps {
    targetType: 'post' | 'quote' | 'homepage' | 'comment' | 'homepage_comment' | 'note';
    targetId: string;
    initialCount?: number;
    className?: string;
}

export default function LikeButton({ targetType, targetId, initialCount = 0, className = "" }: LikeButtonProps) {
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(initialCount);
    const [animating, setAnimating] = useState(false);
    const [locked, setLocked] = useState(false);
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
    const [isInitialized, setIsInitialized] = useState(false);
    
    const isMobile = useIsMobile();
    const mountedRef = useRef(true);

    // 持久化存储 Key - 针对单个内容
    const getStorageKey = () => `aura_like_${targetType}_${targetId}_${new Date().toISOString().split('T')[0]}`;

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                // 先设置本地状态，避免闪烁
                const isLiked = checkIfLikedLocal(targetType, targetId);
                const localUserCount = parseInt(localStorage.getItem(getStorageKey()) || '0');
                
                if (mountedRef.current) {
                    setLiked(isLiked);
                    setCount(initialCount);
                    
                    if (localUserCount >= 5) {
                        setLocked(true);
                    }
                    
                    setIsInitialized(true);
                }

                // 然后异步获取最新数据
                const total = await engagementApi.getLikeCount(targetType, targetId);
                
                if (mountedRef.current) {
                    setCount(total);
                }

                // 后端验证用户对此内容的点赞次数
                const fingerprint = getBrowserFingerprint();
                const today = new Date().toISOString().split('T')[0];
                const { data } = await supabase
                    .from('likes')
                    .select('count')
                    .eq('target_type', targetType)
                    .eq('target_id', targetId)
                    .eq('user_fingerprint', fingerprint)
                    .gte('created_at', today)
                    .single();

                const dbUserCount = data?.count || 0;
                
                if (mountedRef.current && dbUserCount >= 5) {
                    setLocked(true);
                    localStorage.setItem(getStorageKey(), dbUserCount.toString());
                }
            } catch (err) {
                console.error('Failed to fetch initial like data:', err);
                if (mountedRef.current) {
                    setIsInitialized(true);
                }
            }
        };
        
        fetchInitial();
    }, [targetType, targetId, initialCount]);

    const showToast = (message: string) => {
        if (!mountedRef.current) return;
        setToast({ message, visible: true });
        setTimeout(() => {
            if (mountedRef.current) {
                setToast(prev => ({ ...prev, visible: false }));
            }
        }, isMobile ? 1500 : 2000);
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (locked) {
            showToast('不许这么喜欢我❤️');
            return;
        }

        // 检查当前用户对此内容的点赞次数
        const currentUserCount = parseInt(localStorage.getItem(getStorageKey()) || '0');
        if (currentUserCount >= 5) {
            setLocked(true);
            showToast('不许这么喜欢我❤️');
            return;
        }

        // UI 立即反馈
        if (mountedRef.current) {
            setCount(prev => prev + 1);
            const nextUserCount = currentUserCount + 1;
            localStorage.setItem(getStorageKey(), nextUserCount.toString());

            if (nextUserCount >= 5) {
                setLocked(true);
            }

            // 触发动画效果
            setAnimating(true);
            setTimeout(() => {
                if (mountedRef.current) {
                    setAnimating(false);
                }
            }, isMobile ? 400 : 600); // 移动端动画更快
        }

        // 移动端触觉反馈
        if (isMobile && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([10, 50, 10]); // 更丰富的震动模式
        }

        // 后端同步
        try {
            const fingerprint = getBrowserFingerprint();
            const result = await engagementApi.toggleLike(targetType, targetId, fingerprint);
            
            if (mountedRef.current) {
                setLiked(true);
                setLikedLocal(targetType, targetId, true);

                // 后端确认点赞次数
                if (result.count >= 5) {
                    setLocked(true);
                    localStorage.setItem(getStorageKey(), '5');
                }
            }
        } catch (err: any) {
            if (!mountedRef.current) return;
            
            if (err.message === 'CONTENT_LIMIT_REACHED') {
                setLocked(true);
                localStorage.setItem(getStorageKey(), '5');
                showToast('不许这么喜欢我❤️');
            } else {
                console.error('Failed to toggle like:', err);
                // 回滚UI状态
                setCount(prev => prev - 1);
                localStorage.setItem(getStorageKey(), currentUserCount.toString());
                showToast('点赞失败，请重试 😅');
            }
        }
    };

    // 在初始化完成前显示稳定状态，避免闪烁
    if (!isInitialized) {
        return (
            <div className="relative inline-block" style={{ isolation: 'isolate', overflow: 'visible' }}>
                <button
                    className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 bg-white/5 text-white/40 border border-white/5 ${className}`}
                    disabled
                >
                    <div className="relative">
                        <svg
                            className="w-5 h-5 fill-none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                    </div>
                    <span className="text-sm font-bold tracking-tight tabular-nums">
                        {initialCount}
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div className="relative inline-block" style={{ 
            isolation: 'isolate', 
            overflow: 'visible',
            zIndex: Z_INDEX.LIKE_TOAST // 确保整个容器在最高层级
        }}>
            {/* Apple 风格 Toast - 显示在按钮附近，避开导航栏 */}
            {toast.visible && (
                <div 
                    className={`absolute pointer-events-none ${
                        isMobile 
                            ? '-top-16 right-0 -translate-x-2' // 移动端偏左一点，不遮挡爱心
                            : '-top-20 left-1/2 -translate-x-1/2'
                    } animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300`}
                    style={{ zIndex: Z_INDEX.LIKE_TOAST }}
                >
                    <div className={`relative bg-gradient-to-r from-black/95 to-gray-900/95 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl ${
                        isMobile ? 'px-4 py-2.5' : 'px-6 py-3'
                    }`}>
                        {/* 发光效果 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-2xl blur-sm" />
                        
                        <span className={`relative font-bold text-white tracking-wide whitespace-nowrap ${
                            isMobile ? 'text-sm' : 'text-base'
                        }`}>
                            {toast.message}
                        </span>
                        
                        {/* 装饰性光点 */}
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
                    </div>
                    
                    {/* 小箭头指向按钮 - 移动端调整箭头位置 */}
                    <div className={`absolute top-full ${
                        isMobile ? 'right-6' : 'left-1/2 -translate-x-1/2'
                    } ${
                        isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'
                    } bg-gradient-to-br from-black/95 to-gray-900/95 border-r border-b border-white/40 rotate-45 -mt-1`} />
                </div>
            )}

            <button
                onClick={handleLike}
                disabled={false} // 不禁用，以便显示提示
                className={`group relative flex items-center gap-2 rounded-full transition-all duration-300 overflow-hidden ${
                    isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
                } ${
                    locked ? 'opacity-40 grayscale cursor-not-allowed' : 
                    isMobile ? 'active:scale-90 active:bg-white/20' : 'active:scale-95 hover:scale-105'
                } ${
                    liked
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        : `bg-white/5 text-white/40 border-white/5 ${
                            isMobile ? 'active:text-white/80 active:bg-white/15' : 'hover:text-white/60 hover:bg-white/10'
                        }`
                } border ${className}`}
                style={{
                    // 移动端优化触摸区域
                    minHeight: isMobile ? '44px' : 'auto',
                    minWidth: isMobile ? '44px' : 'auto',
                    // 防止双击缩放
                    touchAction: 'manipulation'
                }}
            >
                {/* 苹果风格的点击涟漪效果 */}
                {animating && !locked && (
                    <div className="absolute inset-0 pointer-events-none">
                        {/* 主涟漪 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/30 to-pink-500/30 rounded-full animate-apple-ripple" />
                        {/* 次级涟漪 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-400/20 to-pink-400/20 rounded-full animate-apple-ripple-delayed" />
                        {/* 光晕效果 */}
                        <div className="absolute inset-0 bg-rose-500/10 rounded-full animate-apple-glow blur-sm" />
                    </div>
                )}

                {/* 背景脉冲效果 */}
                {animating && !locked && (
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-pink-500/5 rounded-full animate-apple-pulse" />
                )}

                <div className="relative z-10">
                    <svg
                        className={`w-5 h-5 transition-all duration-500 ${
                            liked ? 'fill-current scale-110' : 'fill-none scale-100'
                        } ${
                            animating && !locked ? 'animate-apple-heart-bounce' : ''
                        }`}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>

                    {/* 心跳效果 */}
                    {animating && !locked && (
                        <div className="absolute inset-0 animate-apple-heartbeat">
                            <svg className="w-5 h-5 fill-current text-rose-500 opacity-60" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                    )}
                </div>

                <span className={`relative z-10 text-sm font-bold tracking-tight tabular-nums transition-all duration-300 ${
                    animating && !locked ? 'animate-apple-number-bounce' : ''
                }`}>
                    {count}
                </span>

                {/* 增强的粒子爆炸效果 */}
                {!locked && animating && (
                    <div className="absolute inset-0 pointer-events-none">
                        {/* 主要粒子 */}
                        {[...Array(16)].map((_, i) => (
                            <div
                                key={`main-${i}`}
                                className="absolute left-1/2 top-1/2 animate-apple-particle-enhanced"
                                style={{
                                    '--angle': `${(360 / 16) * i + Math.random() * 20 - 10}deg`,
                                    '--distance': `${Math.random() * 80 + 60}px`,
                                    '--size': `${Math.random() * 6 + 6}px`,
                                    '--delay': `${Math.random() * 0.3}s`,
                                    '--duration': `${0.8 + Math.random() * 0.4}s`,
                                    width: 'var(--size)',
                                    height: 'var(--size)',
                                } as React.CSSProperties}
                            >
                                <div className="w-full h-full bg-gradient-to-br from-rose-400 to-pink-500 rounded-full shadow-lg" />
                            </div>
                        ))}
                        
                        {/* 次级小粒子 */}
                        {[...Array(24)].map((_, i) => (
                            <div
                                key={`secondary-${i}`}
                                className="absolute left-1/2 top-1/2 animate-apple-particle-small"
                                style={{
                                    '--angle': `${Math.random() * 360}deg`,
                                    '--distance': `${Math.random() * 120 + 40}px`,
                                    '--size': `${Math.random() * 3 + 2}px`,
                                    '--delay': `${Math.random() * 0.4}s`,
                                    width: 'var(--size)',
                                    height: 'var(--size)',
                                } as React.CSSProperties}
                            >
                                <div className="w-full h-full bg-rose-300/60 rounded-full blur-[0.5px]" />
                            </div>
                        ))}

                        {/* 星形闪烁效果 */}
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={`star-${i}`}
                                className="absolute left-1/2 top-1/2 animate-apple-star-twinkle"
                                style={{
                                    '--angle': `${(360 / 8) * i}deg`,
                                    '--distance': `${30 + Math.random() * 20}px`,
                                    '--delay': `${Math.random() * 0.5}s`,
                                } as React.CSSProperties}
                            >
                                <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" 
                                     style={{ 
                                         clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                                         filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))'
                                     }} 
                                />
                            </div>
                        ))}
                    </div>
                )}
            </button>

            <style>{`
                /* 苹果风格涟漪效果 */
                @keyframes apple-ripple {
                    0% {
                        transform: scale(0);
                        opacity: 0.8;
                    }
                    50% {
                        opacity: 0.4;
                    }
                    100% {
                        transform: scale(4);
                        opacity: 0;
                    }
                }

                @keyframes apple-ripple-delayed {
                    0% {
                        transform: scale(0);
                        opacity: 0.6;
                    }
                    60% {
                        opacity: 0.3;
                    }
                    100% {
                        transform: scale(3.5);
                        opacity: 0;
                    }
                }

                @keyframes apple-glow {
                    0% {
                        transform: scale(1);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(2);
                        opacity: 0.6;
                    }
                    100% {
                        transform: scale(3);
                        opacity: 0;
                    }
                }

                @keyframes apple-pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.2;
                    }
                    50% {
                        transform: scale(1.1);
                        opacity: 0.4;
                    }
                }

                /* 心形图标弹跳效果 */
                @keyframes apple-heart-bounce {
                    0% {
                        transform: scale(1);
                    }
                    15% {
                        transform: scale(1.3) rotate(-5deg);
                    }
                    30% {
                        transform: scale(1.1) rotate(3deg);
                    }
                    45% {
                        transform: scale(1.2) rotate(-2deg);
                    }
                    60% {
                        transform: scale(1.05) rotate(1deg);
                    }
                    100% {
                        transform: scale(1.1) rotate(0deg);
                    }
                }

                /* 心跳效果 */
                @keyframes apple-heartbeat {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0;
                    }
                    25% {
                        transform: scale(1.2);
                        opacity: 0.6;
                    }
                    50% {
                        transform: scale(1);
                        opacity: 0.3;
                    }
                    75% {
                        transform: scale(1.1);
                        opacity: 0.4;
                    }
                }

                /* 数字弹跳效果 */
                @keyframes apple-number-bounce {
                    0% {
                        transform: translateY(0);
                    }
                    30% {
                        transform: translateY(-8px) scale(1.1);
                    }
                    60% {
                        transform: translateY(-2px) scale(1.05);
                    }
                    100% {
                        transform: translateY(0) scale(1);
                    }
                }

                /* 增强的粒子效果 */
                @keyframes apple-particle-enhanced {
                    0% {
                        transform: translate(-50%, -50%) rotate(0deg) scale(0);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                        transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1.2);
                    }
                    70% {
                        opacity: 0.8;
                        transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-0.7 * var(--distance))) scale(1);
                    }
                    100% {
                        transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-1 * var(--distance))) scale(0);
                        opacity: 0;
                    }
                }

                @keyframes apple-particle-small {
                    0% {
                        transform: translate(-50%, -50%) rotate(0deg) scale(0);
                        opacity: 0;
                    }
                    20% {
                        opacity: 0.8;
                        transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
                    }
                    100% {
                        transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-1 * var(--distance))) scale(0);
                        opacity: 0;
                    }
                }

                /* 星形闪烁效果 */
                @keyframes apple-star-twinkle {
                    0% {
                        transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-1 * var(--distance))) scale(0) rotate(0deg);
                        opacity: 0;
                    }
                    20% {
                        opacity: 1;
                        transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-1 * var(--distance))) scale(1) rotate(180deg);
                    }
                    80% {
                        opacity: 0.6;
                        transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-1 * var(--distance))) scale(0.8) rotate(360deg);
                    }
                    100% {
                        transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-1 * var(--distance))) scale(0) rotate(540deg);
                        opacity: 0;
                    }
                }

                .animate-apple-ripple {
                    animation: apple-ripple 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .animate-apple-ripple-delayed {
                    animation: apple-ripple-delayed 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
                }

                .animate-apple-glow {
                    animation: apple-glow 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .animate-apple-pulse {
                    animation: apple-pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) forwards;
                }

                .animate-apple-heart-bounce {
                    animation: apple-heart-bounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
                }

                .animate-apple-heartbeat {
                    animation: apple-heartbeat 1.2s cubic-bezier(0.4, 0, 0.6, 1) forwards;
                }

                .animate-apple-number-bounce {
                    animation: apple-number-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
                }

                .animate-apple-particle-enhanced {
                    animation: apple-particle-enhanced var(--duration) cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    animation-delay: var(--delay);
                }

                .animate-apple-particle-small {
                    animation: apple-particle-small 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    animation-delay: var(--delay);
                }

                .animate-apple-star-twinkle {
                    animation: apple-star-twinkle 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    animation-delay: var(--delay);
                }
            `}</style>
        </div>
    );
}
