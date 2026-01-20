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
    const [comboCount, setComboCount] = useState(0);
    
    const isMobile = useIsMobile();
    const mountedRef = useRef(true);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 持久化存储 Key - 针对单个内容
    const getStorageKey = () => `aura_like_${targetType}_${targetId}_${new Date().toISOString().split('T')[0]}`;

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }
            if (comboTimeoutRef.current) {
                clearTimeout(comboTimeoutRef.current);
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

        // 立即更新UI状态 - 无需等待
        const newClickCount = currentUserCount + 1;
        setClickCount(newClickCount);
        setCount(prev => prev + 1);
        localStorage.setItem(getStorageKey(), newClickCount.toString());

        // 检查是否达到上限
        if (newClickCount >= 5) {
            setLocked(true);
            showToast('不许这么喜欢我❤️');
        }

        // 立即触发动画效果 - 连击时更快
        setAnimating(true);
        setComboCount(prev => prev + 1);
        
        // 重置连击计数器
        if (comboTimeoutRef.current) {
            clearTimeout(comboTimeoutRef.current);
        }
        comboTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
                setComboCount(0);
            }
        }, 800); // 缩短重置时间，提升连击体验

        setTimeout(() => {
            if (mountedRef.current) {
                setAnimating(false);
            }
        }, isMobile ? 150 : 200); // 更快的动画时间，支持连续点击

        // 移动端触觉反馈
        if (isMobile) {
            haptics.success();
        }

        // 异步处理后端请求，不阻塞UI
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
        }, 50); // 进一步缩短防抖时间，提升响应速度
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
            zIndex: Z_INDEX.LIKE_TOAST
        }}>
            {/* Toast 提示 */}
            {toast.visible && (
                <div 
                    className={`absolute pointer-events-none ${
                        isMobile 
                            ? '-top-16 right-0 -translate-x-2'
                            : '-top-20 left-1/2 -translate-x-1/2'
                    } animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300`}
                    style={{ zIndex: Z_INDEX.LIKE_TOAST }}
                >
                    <div className={`relative bg-gradient-to-r from-black/95 to-gray-900/95 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl ${
                        isMobile ? 'px-4 py-2.5' : 'px-6 py-3'
                    }`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-2xl blur-sm" />
                        <span className={`relative font-bold text-white tracking-wide whitespace-nowrap ${
                            isMobile ? 'text-sm' : 'text-base'
                        }`}>
                            {toast.message}
                        </span>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
                    </div>
                    <div className={`absolute top-full ${
                        isMobile ? 'right-6' : 'left-1/2 -translate-x-1/2'
                    } ${
                        isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'
                    } bg-gradient-to-br from-black/95 to-gray-900/95 border-r border-b border-white/40 rotate-45 -mt-1`} />
                </div>
            )}

            <button
                onClick={handleLike}
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
                    minHeight: isMobile ? '44px' : 'auto',
                    minWidth: isMobile ? '44px' : 'auto',
                    touchAction: 'manipulation'
                }}
            >
                {/* 动态背景光效 */}
                {animating && !locked && (
                    <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                        comboCount > 3 ? 'bg-gradient-to-r from-rose-500/40 to-pink-500/40 scale-125' :
                        comboCount > 1 ? 'bg-gradient-to-r from-rose-500/30 to-pink-500/30 scale-110' :
                        'bg-gradient-to-r from-rose-500/20 to-pink-500/20 scale-105'
                    }`} />
                )}

                <div className="relative z-10">
                    <svg
                        className={`w-5 h-5 transition-all duration-300 ${
                            liked ? 'fill-current scale-110' : 'fill-none scale-100'
                        } ${
                            animating && !locked ? (
                                comboCount > 3 ? 'scale-150' :
                                comboCount > 1 ? 'scale-125' :
                                'scale-110'
                            ) : ''
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

                <span className={`relative z-10 text-sm font-bold tracking-tight tabular-nums transition-all duration-200 ${
                    animating && !locked ? (
                        comboCount > 3 ? 'scale-110 -translate-y-1' :
                        comboCount > 1 ? 'scale-105 -translate-y-0.5' :
                        '-translate-y-0.5'
                    ) : ''
                }`}>
                    {count}
                </span>

                {/* 简化的粒子效果 */}
                {!locked && animating && comboCount > 1 && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(comboCount > 3 ? 8 : 4)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute left-1/2 top-1/2 w-1 h-1 bg-rose-400 rounded-full opacity-80"
                                style={{
                                    transform: `translate(-50%, -50%) rotate(${(360 / (comboCount > 3 ? 8 : 4)) * i}deg) translateY(-${20 + Math.random() * 20}px)`,
                                    animation: `fadeOut 0.6s ease-out forwards`,
                                    animationDelay: `${i * 0.05}s`
                                }}
                            />
                        ))}
                    </div>
                )}
            </button>

            <style>{`
                @keyframes fadeOut {
                    0% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
                }
            `}</style>
        </div>
    );
}