import { useState, useEffect, useLayoutEffect, useRef, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { engagementApi, supabase } from '../services/supabaseService';
import { getBrowserFingerprint } from '../utils/engagement';
import { useIsMobile } from '../hooks/useResponsive';

interface LikeButtonProps {
    targetType: 'post' | 'quote' | 'homepage' | 'comment' | 'homepage_comment' | 'note';
    targetId: string;
    initialCount?: number;
    className?: string;
}

export default function LikeButton({ targetType, targetId, initialCount = 0, className = "" }: LikeButtonProps) {
    const [count, setCount] = useState(initialCount);
    const [locked, setLocked] = useState(false);
    const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'success' | 'warning' | 'info' }>({ 
        message: '', 
        visible: false, 
        type: 'success' 
    });
    const [burst, setBurst] = useState<{ id: number; x: number; r: number } | null>(null);
    
    const isMobile = useIsMobile();
    const isProcessingRef = useRef(false);

    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const iconRef = useRef<SVGSVGElement | null>(null);
    const toastRef = useRef<HTMLDivElement | null>(null);
    const toastTimerRef = useRef<number | null>(null);
    const [toastLayout, setToastLayout] = useState<{ top: number; left: number; placement: 'top' | 'bottom'; arrowLeft: number } | null>(null);

    const getLocalLikeKey = () => `aura_like_${targetType}_${targetId}_${getBrowserFingerprint()}`;

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const fingerprint = getBrowserFingerprint();
                
                const total = await engagementApi.getLikeCount(targetType, targetId);
                setCount(total);

                const { data } = await supabase
                    .from('likes')
                    .select('count')
                    .eq('target_type', targetType)
                    .eq('target_id', targetId)
                    .eq('user_fingerprint', fingerprint)
                    .maybeSingle();

                const localCount = parseInt(localStorage.getItem(getLocalLikeKey()) || '0');
                const dbCount = data?.count || 0;
                
                if (dbCount >= 5 || localCount >= 5) {
                    setLocked(true);
                }
            } catch (err) {
                console.error('Failed to fetch initial like data:', err);
            }
        };
        fetchInitial();
    }, [targetType, targetId]);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
        };
    }, []);

    const updateToastPosition = () => {
        const anchorEl = buttonRef.current;
        const toastEl = toastRef.current;
        if (!anchorEl || !toastEl) return;

        const anchorRect = anchorEl.getBoundingClientRect();
        const toastRect = toastEl.getBoundingClientRect();

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const margin = isMobile ? 12 : 16;
        const gap = isMobile ? 10 : 14;

        const anchorX = anchorRect.left + anchorRect.width / 2;
        const anchorY = anchorRect.top;
        
        const spaceTop = anchorY - margin;
        const spaceBottom = vh - anchorRect.bottom - margin;
        
        const placement: 'top' | 'bottom' = spaceTop >= toastRect.height ? 'top' : 'bottom';

        let left = anchorX - toastRect.width / 2;
        left = Math.max(margin, Math.min(left, vw - margin - toastRect.width));

        let top = placement === 'top'
            ? anchorRect.top - gap - toastRect.height
            : anchorRect.bottom + gap;
        top = Math.max(margin, Math.min(top, vh - margin - toastRect.height));

        const minArrow = isMobile ? 16 : 20;
        const maxArrow = toastRect.width - minArrow;
        const arrowLeft = Math.max(minArrow, Math.min(anchorX - left, maxArrow));

        setToastLayout({ top, left, placement, arrowLeft });
    };

    useLayoutEffect(() => {
        if (!toast.visible) {
            setToastLayout(null);
            return;
        }

        requestAnimationFrame(() => {
            updateToastPosition();
        });
    }, [toast.visible, toast.message, isMobile]);

    useEffect(() => {
        if (!toast.visible) return;

        const handler = () => updateToastPosition();
        window.addEventListener('resize', handler, { passive: true });
        window.addEventListener('scroll', handler, true);
        return () => {
            window.removeEventListener('resize', handler);
            window.removeEventListener('scroll', handler, true);
        };
    }, [toast.visible, isMobile]);

    const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
        setToast({ message, visible: true, type });
        if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = window.setTimeout(() => setToast(prev => ({ ...prev, visible: false })), isMobile ? 1800 : 2200);
    };

    const handleLike = async (e: MouseEvent) => {
        e.stopPropagation();
        if (isProcessingRef.current) return;

        const currentCount = parseInt(localStorage.getItem(getLocalLikeKey()) || '0');
        
        if (locked || currentCount >= 5) {
            setLocked(true);
            showToast(`已达到点赞上限 (5/5)`, 'warning');
            return;
        }

        isProcessingRef.current = true;
        
        setBurst({
            id: Date.now(),
            x: (Math.random() - 0.5) * (isMobile ? 10 : 14),
            r: (Math.random() - 0.5) * 18
        });
        window.setTimeout(() => setBurst(null), isMobile ? 600 : 700);
        
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([8, 30, 8]);
        }

        setTimeout(() => {
            isProcessingRef.current = false;
        }, 200);

        try {
            const fingerprint = getBrowserFingerprint();
            const result = await engagementApi.toggleLike(targetType, targetId, fingerprint);
            
            localStorage.setItem(getLocalLikeKey(), result.count.toString());
            setCount(prev => prev + 1);

            if (result.count >= 5) {
                setLocked(true);
                showToast(`已达到点赞上限 (5/5)`, 'warning');
            }
        } catch (err: any) {
            if (err.message === 'LIMIT_REACHED') {
                setLocked(true);
                localStorage.setItem(getLocalLikeKey(), '5');
                showToast(`已达到点赞上限 (5/5)`, 'warning');
            } else {
                console.error('Failed to toggle like:', err);
                setCount(prev => prev - 1);
                showToast('点赞失败，请稍后重试', 'warning');
            }
        }
    };

    return (
        <div className="relative inline-block">
            <AnimatePresence>
                {toast.visible && (
                    <motion.div
                        style={{
                            top: toastLayout?.top ?? 0,
                            left: toastLayout?.left ?? 0,
                            visibility: toastLayout ? 'visible' : 'hidden'
                        }}
                        initial={{ 
                            opacity: 0, 
                            scale: 0.75,
                            y: (toastLayout?.placement ?? 'top') === 'top' ? 8 : -8
                        }}
                        animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            y: 0
                        }}
                        exit={{ 
                            opacity: 0, 
                            scale: 0.85,
                            y: (toastLayout?.placement ?? 'top') === 'top' ? -6 : 6
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 28,
                            mass: 0.6
                        }}
                        className="fixed z-[9999] pointer-events-none"
                    >
                        <motion.div 
                            ref={toastRef}
                            className={`relative overflow-hidden ${
                                isMobile ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
                            } font-medium text-white/90`}
                            style={{
                                borderRadius: isMobile ? '12px' : '16px',
                                background: 'rgba(0, 0, 0, 0.88)',
                                backdropFilter: 'blur(16px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 0.5px rgba(255, 255, 255, 0.15)',
                                border: '0.5px solid rgba(255, 255, 255, 0.2)'
                            }}
                        >
                            <div className="relative flex items-center gap-2">
                                <motion.div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                        toast.type === 'warning' ? 'bg-white/70' : 'bg-white/90'
                                    }`}
                                    animate={{ 
                                        scale: [1, 1.15, 1],
                                        opacity: [0.7, 1, 0.7]
                                    }}
                                    transition={{ 
                                        duration: 1.8,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                                
                                <span className="text-white/95">{toast.message}</span>
                            </div>

                            <motion.div
                                className="absolute bottom-0 left-0 h-px bg-white/20"
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: isMobile ? 1.8 : 2.2, ease: "linear" }}
                            />

                            <div 
                                className="absolute"
                                style={{
                                    left: toastLayout?.arrowLeft ?? 0,
                                    transform: 'translateX(-50%)',
                                    top: (toastLayout?.placement ?? 'top') === 'bottom' ? '-5px' : undefined,
                                    bottom: (toastLayout?.placement ?? 'top') === 'top' ? '-5px' : undefined,
                                    width: 0,
                                    height: 0,
                                    borderLeft: '5px solid transparent',
                                    borderRight: '5px solid transparent',
                                    borderTop:
                                        (toastLayout?.placement ?? 'top') === 'bottom'
                                            ? '5px solid rgba(0, 0, 0, 0.88)'
                                            : undefined,
                                    borderBottom:
                                        (toastLayout?.placement ?? 'top') === 'top'
                                            ? '5px solid rgba(0, 0, 0, 0.88)'
                                            : undefined,
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={handleLike}
                disabled={locked}
                ref={buttonRef}
                className={`group relative flex items-center gap-2 ${
                    isMobile ? 'px-2 py-1.5' : 'px-3 py-2'
                } rounded-full transition-all duration-150 overflow-hidden ${
                    locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                    'bg-white/5 text-white/50 hover:text-white/70 hover:bg-white/10'
                } ${className}`}
                whileHover={!locked ? {
                    scale: isMobile ? 1.02 : 1.05,
                    transition: { duration: 0.1, ease: [0.4, 0.0, 0.2, 1] }
                } : {}}
                whileTap={!locked ? {
                    scale: isMobile ? 0.96 : 0.94,
                    transition: { duration: 0.08, ease: [0.4, 0.0, 0.2, 1] }
                } : {}}
                style={{
                    backdropFilter: isMobile ? 'blur(8px)' : 'blur(12px)',
                    WebkitBackdropFilter: isMobile ? 'blur(8px)' : 'blur(12px)',
                }}
                aria-label={locked ? `已达到点赞上限 (5/5)` : `点赞 (${count})`}
            >
                <motion.div
                    className="absolute inset-0 bg-white/10 rounded-full"
                    whileTap={{ 
                        scale: isMobile ? 1.3 : 1.5, 
                        opacity: [0, 0.25, 0] 
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                />

                <motion.svg
                    ref={iconRef}
                    className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} transition-colors duration-200 fill-none`}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    whileTap={{ 
                        scale: [1, 1.15, 0.95, 1],
                        rotate: [0, -8, 6, 0]
                    }}
                    transition={{ duration: 0.35, ease: [0.4, 0.0, 0.2, 1] }}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </motion.svg>

                <motion.span 
                    className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium tabular-nums`}
                    whileTap={{ 
                        scale: [1, 1.1, 1] 
                    }}
                    transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
                >
                    {count}
                </motion.span>

                {!locked && burst && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(isMobile ? 5 : 7)].map((_, i, arr) => (
                            <motion.div
                                key={`particle-${i}`}
                                className={`absolute left-1/2 top-1/2 ${
                                    isMobile ? 'w-0.5 h-0.5' : 'w-1 h-1'
                                } bg-rose-400/70 rounded-full`}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: [0, 1, 0],
                                    opacity: [0, 0.9, 0],
                                    x: Math.cos((i * (360 / arr.length)) * Math.PI / 180) * (isMobile ? 8 : 12),
                                    y: Math.sin((i * (360 / arr.length)) * Math.PI / 180) * (isMobile ? 8 : 12),
                                }}
                                transition={{
                                    duration: 0.4,
                                    ease: [0.4, 0.0, 0.2, 1],
                                    delay: i * 0.01
                                }}
                            />
                        ))}

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
                                    duration: 0.35,
                                    ease: [0.4, 0.0, 0.2, 1],
                                    delay: 0.05
                                }}
                            />
                        ))}

                        <motion.div
                            className="absolute left-1/2 top-1/2 border border-rose-400/40 rounded-full"
                            initial={{ scale: 0, opacity: 0.9 }}
                            animate={{ 
                                scale: isMobile ? 2.5 : 3, 
                                opacity: 0 
                            }}
                            transition={{ 
                                duration: 0.4, 
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

                {!locked && burst && (
                    <motion.div
                        key={burst.id}
                        className="absolute left-1/2 top-1/2"
                        initial={{ opacity: 0, y: 0, x: burst.x, scale: 0.6, rotate: burst.r }}
                        animate={{ opacity: [0, 0.95, 0], y: isMobile ? -18 : -22, scale: [0.7, 1.05, 0.9] }}
                        transition={{ duration: isMobile ? 0.55 : 0.6, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            marginLeft: isMobile ? '-6px' : '-7px',
                            marginTop: isMobile ? '-6px' : '-7px'
                        }}
                    >
                        <svg
                            width={isMobile ? 12 : 14}
                            height={isMobile ? 12 : 14}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="text-rose-400/80"
                        >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    </motion.div>
                )}
            </motion.button>
        </div>
    );
}
