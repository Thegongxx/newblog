
import React, { useState, useEffect } from 'react';
import { engagementApi } from '../services/supabaseService';
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
    const [sessionClicks, setSessionClicks] = useState(0);

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const c = await engagementApi.getLikeCount(targetType, targetId);
                setCount(c);
                const isLiked = checkIfLikedLocal(targetType, targetId);
                setLiked(isLiked);
            } catch (err) {
                console.error('Failed to fetch initial like data:', err);
            }
        };
        fetchInitial();
    }, [targetType, targetId]);

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (locked || sessionClicks >= 5) return;

        // 立即反馈 UI
        const newCount = count + 1;
        const newSessionClicks = sessionClicks + 1;
        setCount(newCount);
        setSessionClicks(newSessionClicks);

        if (newSessionClicks >= 5) {
            setLocked(true);
        }

        // 触发点击动画
        setAnimating(true);
        setTimeout(() => setAnimating(false), 600);

        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(10);
        }

        // 后端同步
        try {
            const fingerprint = getBrowserFingerprint();
            const result = await engagementApi.toggleLike(targetType, targetId, fingerprint);
            setLiked(true);
            setLikedLocal(targetType, targetId, true);
            // 如果后端反馈已达上限，则锁定
            if (result && result.count >= 5) setLocked(true); // Assuming result might contain updated count or status
        } catch (err: any) {
            if (err.message === 'DAILY_LIMIT_REACHED') {
                setLocked(true);
                setCount(prev => prev - 1); // Rollback UI count
                alert('你今天已经点过很多赞啦，明天再来吧！🌿');
            } else {
                console.error('Failed to toggle like:', err);
                setCount(prev => prev - 1); // Rollback UI count on other errors too
                setSessionClicks(prev => prev - 1); // Rollback session clicks
            }
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={locked}
            className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 ${locked ? 'opacity-30 cursor-not-allowed grayscale' : 'active:scale-90'} ${liked
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                : 'bg-white/5 text-white/40 hover:text-white/60 hover:bg-white/10 border-white/5'
                } border ${className}`}
        >
            <div className={`relative transition-transform duration-500 ${animating ? 'scale-125' : 'scale-100'}`}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={liked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-5 h-5 transition-all duration-500"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>

                {/* 点击时的粒子扩散效果 */}
                {animating && liked && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-rose-500 rounded-full animate-particle"
                                style={{
                                    '--angle': `${i * 60}deg`,
                                    '--dist': '20px'
                                } as any}
                            />
                        ))}
                    </div>
                )}
            </div>

            <span className={`text-sm font-medium tabular-nums ${liked ? 'text-rose-500' : ''}`}>
                {count > 0 ? count : '赞'}
            </span>

            <style>{`
        @keyframes aura-particle {
          0% { transform: rotate(var(--angle)) translateY(0); opacity: 1; }
          100% { transform: rotate(var(--angle)) translateY(calc(-1 * var(--dist))); opacity: 0; }
        }
        .animate-particle {
          animation: aura-particle 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
        </button>
    );
}
