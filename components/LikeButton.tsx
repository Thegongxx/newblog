import React, { useState, useEffect } from 'react';
import { engagementApi, supabase } from '../services/supabaseService';
import { getBrowserFingerprint, checkIfLikedLocal, setLikedLocal } from '../utils/engagement';

interface LikeButtonProps {
    targetType: 'post' | 'quote' | 'homepage';
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

    // 持久化存储 Key
    const getStorageKey = () => `aura_like_limit_${targetType}_${targetId}_${new Date().toISOString().split('T')[0]}`;

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                // 1. 获取总数
                const total = await engagementApi.getLikeCount(targetType, targetId);
                setCount(total);
                const isLiked = checkIfLikedLocal(targetType, targetId);
                setLiked(isLiked);

                // 2. 检查本地持久化锁定
                const localCount = parseInt(localStorage.getItem(getStorageKey()) || '0');
                if (localCount >= 5) {
                    setLocked(true);
                }

                // 3. 后端双重校验（防止清除缓存后刷票）
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
                    localStorage.setItem(getStorageKey(), dbCount.toString());
                }
            } catch (err) {
                console.error('Failed to fetch initial like data:', err);
            }
        };
        fetchInitial();
    }, [targetType, targetId]);

    const showToast = (message: string) => {
        setToast({ message, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (locked) {
            showToast('今日已达上限 🌿');
            return;
        }

        // 立即计算新的本地计数
        const currentLocal = parseInt(localStorage.getItem(getStorageKey()) || '0');
        if (currentLocal >= 5) {
            setLocked(true);
            showToast('今日已达上限 🌿');
            return;
        }

        // UI 立即增加反馈
        setCount(prev => prev + 1);
        const nextLocal = currentLocal + 1;
        localStorage.setItem(getStorageKey(), nextLocal.toString());

        if (nextLocal >= 5) {
            setLocked(true);
        }

        // 触发物理动效
        setAnimating(true);
        setTimeout(() => setAnimating(false), 600);
        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(10);

        // 后端同步
        try {
            const fingerprint = getBrowserFingerprint();
            const result = await engagementApi.toggleLike(targetType, targetId, fingerprint);
            setLiked(true);
            setLikedLocal(targetType, targetId, true);

            // 如果后端确认已达上限，强制同步锁定
            if (result.count >= 5) {
                setLocked(true);
                localStorage.setItem(getStorageKey(), '5');
            }
        } catch (err: any) {
            if (err.message === 'DAILY_LIMIT_REACHED') {
                setLocked(true);
                localStorage.setItem(getStorageKey(), '5');
                showToast('今日已达上限 🌿');
            } else {
                console.error('Failed to toggle like:', err);
                // Rollback UI count and local storage if other errors occur
                setCount(prev => prev - 1);
                localStorage.setItem(getStorageKey(), currentLocal.toString());
            }
        }
    };

    return (
        <div className="relative inline-block">
            {/* Apple 风格 Toast */}
            {toast.visible && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 px-4 py-2 rounded-2xl shadow-2xl">
                        <span className="text-xs font-bold text-white tracking-widest whitespace-nowrap uppercase">{toast.message}</span>
                    </div>
                </div>
            )}

            <button
                onClick={handleLike}
                disabled={false} // 改为不禁用，以便展示 Toast 提示
                className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 ${locked ? 'opacity-40 grayscale-[0.5]' : 'active:scale-95'} ${liked
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    : 'bg-white/5 text-white/40 hover:text-white/60 hover:bg-white/10 border-white/5'
                    } border ${className}`}
            >
                <div className="relative">
                    <svg
                        className={`w-5 h-5 transition-all duration-500 ${liked ? 'fill-current scale-110' : 'fill-none scale-100'}`}
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

                    {animating && (
                        <div className="absolute inset-0 animate-ping">
                            <svg className="w-5 h-5 fill-current text-rose-500 opacity-50" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                    )}
                </div>

                <span className="text-sm font-bold tracking-tight tabular-nums transition-all">
                    {count}
                </span>

                {/* 悬浮粒子扩散效果 */}
                {!locked && animating && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute left-1/2 top-1/2 animate-apple-particle"
                                style={{
                                    '--angle': `${Math.random() * 360}deg`,
                                    '--distance': `${Math.random() * 60 + 40}px`,
                                    '--size': `${Math.random() * 4 + 4}px`,
                                    '--delay': `${Math.random() * 0.2}s`,
                                    width: 'var(--size)',
                                    height: 'var(--size)',
                                } as React.CSSProperties}
                            >
                                <div className="w-full h-full bg-rose-500/40 rounded-full blur-[1px]" />
                            </div>
                        ))}
                    </div>
                )}
            </button>

            <style>{`
                @keyframes apple-particle {
                    0% {
                        transform: translate(-50%, -50%) rotate(0deg) scale(0);
                        opacity: 0;
                    }
                    20% {
                        opacity: 1;
                        transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1.2);
                    }
                    100% {
                        transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-1 * var(--distance))) scale(0);
                        opacity: 0;
                    }
                }
                .animate-apple-particle {
                    animation: apple-particle 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    animation-delay: var(--delay);
                }
            `}</style>
        </div>
    );
}
