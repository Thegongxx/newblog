import React, { useState, useEffect, useRef } from 'react';
import { engagementApi, supabase } from '../services/supabaseService';
import { getBrowserFingerprint, checkIfLikedLocal, setLikedLocal } from '../utils/engagement';
import { haptics } from '../utils/haptics';
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
    const [clickCount, setClickCount] = useState(0);
    
    const isMobile = useIsMobile();
    const mountedRef = useRef(true);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 持久化存储 Key - 针对单个内容
    const getStorageKey = () => `aura_like_${targetType}_${targetId}_${new Date().toISOString().split('T')[0]}`;

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }
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
                    setClickCount(localUserCount);
                    
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
                    setClickCount(5);
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

        // 检查是否已达到上限
        const currentUserCount = parseInt(localStorage.getItem(getStorageKey()) || '0');
        
        if (locked || currentUserCount >= 5) {
            showToast('不许这么喜欢我❤️');
            return;
        }

        // 立即更新UI状态
        const newClickCount = currentUserCount + 1;
        setClickCount(newClickCount);
        setCount(prev => prev + 1);
        localStorage.setItem(getStorageKey(), newClickCount.toString());

        // 检查是否达到上限
        if (newClickCount >= 5) {
            setLocked(true);
            showToast('不许这么喜欢我❤️');
        }

        // 触发动画效果
        setAnimating(true);
        setTimeout(() => {
            if (mountedRef.current) {
                setAnimating(false);
            }
        }, isMobile ? 100 : 200); // 减少动画时间，提升连击体验

        // 移动端触觉反馈
        if (isMobile) {
            haptics.success();
        }

        // 防抖处理后端请求 - 不阻止UI响应
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
        }

        clickTimeoutRef.current = setTimeout(async () => {
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
                    const rollbackCount = Math.max(0, newClickCount - 1);
                    setClickCount(rollbackCount);
                    localStorage.setItem(getStorageKey(), rollbackCount.toString());
                    showToast('点赞失败，请重试 😅');
                }
            }
        }, 100); // 大幅减少防抖时间，提升连击响应速度
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
                {/* 简洁的背景光效 */}
                {animating && !locked && (
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-full animate-apple-glow-simple" />
                )}

                <div className="relative z-10">
                    <svg
                        className={`w-5 h-5 transition-all duration-500 ${
                            liked ? 'fill-current scale-110' : 'fill-none scale-100'
                        } ${
                            animating && !locked ? 'animate-apple-heart-simple' : ''
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
                </div>

                <span className={`relative z-10 text-sm font-bold tracking-tight tabular-nums transition-all duration-300 ${
                    animating && !locked ? 'animate-apple-number-simple' : ''
                }`}>
                    {count}
                </span>

                {/* 简洁的粒子效果 */}
                {!locked && animating && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute left-1/2 top-1/2 animate-apple-particle-simple"
                                style={{
                                    '--angle': `${(360 / 6) * i}deg`,
                                    '--distance': `${40 + Math.random() * 20}px`,
                                    '--delay': `${i * 0.05}s`,
                                } as React.CSSProperties}
                            >
                                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full opacity-80" />
                            </div>
                        ))}
                    </div>
                )}

                {/* 苹果风格的涟漪 */}
                {animating && !locked && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 border-2 border-rose-400/30 rounded-full animate-apple-ripple-simple" />
                    </div>
                )}
            </button>

            <style>{`
                /* 简洁的背景光效 */
                @keyframes apple-glow-simple {
                    0% {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.1);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(1.2);
                    }
                }

                /* 简洁的心形弹跳 */
                @keyframes apple-heart-simple {
                    0% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.3);
                    }
                    100% {
                        transform: scale(1.1);
                    }
                }

                /* 简洁的数字动画 */
                @keyframes apple-number-simple {
                    0% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-4px);
                    }
                    100% {
                        transform: translateY(0);
                    }
                }

                /* 简洁的粒子效果 */
                @keyframes apple-particle-simple {
                    0% {
                        transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-1 * var(--distance))) scale(0);
                        opacity: 0;
                    }
                }

                /* 简洁的涟漪效果 */
                @keyframes apple-ripple-simple {
                    0% {
                        transform: scale(1);
                        opacity: 0.6;
                    }
                    100% {
                        transform: scale(2.5);
                        opacity: 0;
                    }
                }

                .animate-apple-glow-simple {
                    animation: apple-glow-simple 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }

                .animate-apple-heart-simple {
                    animation: apple-heart-simple 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
                }

                .animate-apple-number-simple {
                    animation: apple-number-simple 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }

                .animate-apple-particle-simple {
                    animation: apple-particle-simple 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                    animation-delay: var(--delay);
                }

                .animate-apple-ripple-simple {
                    animation: apple-ripple-simple 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
            `}</style>
        </div>
    );
}
