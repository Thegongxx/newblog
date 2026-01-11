import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
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

export default function LikeButton({ targetType, targetId, initialCount = 0, className = '' }: LikeButtonProps) {
  // UI state
  const [count, setCount] = useState<number>(initialCount);
  const [locked, setLocked] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'warning' | 'info' | 'success' }>({
    message: '',
    visible: false,
    type: 'warning'
  });
  const [burst, setBurst] = useState<{ id: number; x: number; r: number } | null>(null);
  const [ripples, setRipples] = useState<Array<{ id: number }>>([]);
  const [pulse, setPulse] = useState(false);

  const isMobile = useIsMobile();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const toastRef = useRef<HTMLDivElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [toastLayout, setToastLayout] = useState<{ top: number; left: number; placement: 'top' | 'bottom'; arrowLeft: number } | null>(null);
  const localContentKey = useRef<string>('');

  // Build per-content local storage key using fingerprint
  const getLocalLikeKey = () => {
    const fp = getBrowserFingerprint();
    return `aura_like_${targetType}_${targetId}_${fp}`;
  };

  // Ripples and heart pulse helpers (Apple-like feedback)
  const spawnRipple = () => {
    const id = Date.now();
    setRipples(rs => [...rs, { id }]);
    setTimeout(() => setRipples(rs => rs.filter(r => r.id !== id)), 600);
  };

  const triggerHeartPulse = () => {
    setPulse(true);
    setTimeout(() => setPulse(false), 180);
  };

  // Initialize: load counts and limit state
  useEffect(() => {
    const init = async () => {
      try {
        const total = await engagementApi.getLikeCount(targetType, targetId);
        setCount(total);
        // local per-content limit check
        const key = getLocalLikeKey();
        localContentKey.current = key;
        const localVal = parseInt(localStorage.getItem(key) || '0');
        if (localVal >= 5) setLocked(true);
        // confirm with server for today
        const fingerprint = getBrowserFingerprint();
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase.from('likes')
          .select('count')
          .eq('target_type', targetType)
          .eq('target_id', targetId)
          .eq('user_fingerprint', fingerprint)
          .gte('created_at', today)
          .maybeSingle();
        const dbCount = data?.count ?? 0;
        if (dbCount >= 5) setLocked(true);
      } catch {
        // ignore initialization errors
      }
    };
    init();
  }, [targetType, targetId]);

  // Toast positioning helper
  const updateToastPosition = () => {
    const btn = buttonRef.current;
    const t = toastRef.current;
    if (!btn || !t) return;
    const r = btn.getBoundingClientRect();
    const w = window.innerWidth, h = window.innerHeight;
    const margin = isMobile ? 8 : 12; // spacing
    const placement: 'top' | 'bottom' = r.top - 8 - t.offsetHeight >= margin ? 'top' : 'bottom';
    let left = r.left + r.width / 2 - t.offsetWidth / 2;
    left = Math.max(margin, Math.min(left, w - margin - t.offsetWidth));
    let top = placement === 'top' ? r.top - t.offsetHeight - 8 : r.bottom + 8;
    top = Math.max(margin, Math.min(top, h - margin - t.offsetHeight));
    const arrowLeft = Math.max(8, Math.min(t.offsetWidth - 8, r.left + r.width / 2 - left));
    setToastLayout({ top, left, placement, arrowLeft });
  };

  useLayoutEffect(() => {
    if (!toast.visible) {
      setToastLayout(null);
      return;
    }
    requestAnimationFrame(() => updateToastPosition());
  }, [toast.visible, toast.message, isMobile]);

  useEffect(() => {
    if (!toast.visible) return;
    const onResize = () => updateToastPosition();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [toast.visible, isMobile]);

  const showToast = (message: string, type: 'warning'|'info'|'success' = 'warning') => {
    setToast({ message, visible: true, type });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(p => ({ ...p, visible: false })), isMobile ? 1800 : 2200);
  };

  // Click handler - Apple-like interaction
  const handleLike = async (e: MouseEvent) => {
    e.stopPropagation();
    // Always breathe Apple style feedback
    spawnRipple();
    triggerHeartPulse();

    const key = getLocalLikeKey();
    const currentLocal = parseInt(localStorage.getItem(key) || '0');

    if (currentLocal >= 5) {
      setLocked(true);
      showToast('已达到点赞上限 (5/5)', 'warning');
      return;
    }

    // Optimistic UI update
    const nextLocal = currentLocal + 1;
    localStorage.setItem(key, String(nextLocal));
    setCount(n => n + 1);

    // quick burst
    setBurst({ id: Date.now(), x: (Math.random() - 0.5) * (isMobile ? 10 : 14), r: (Math.random() - 0.5) * 18 });
    window.setTimeout(() => setBurst(null), isMobile ? 600 : 700);

    // Server sync
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
      if (err?.message === 'LIMIT_REACHED' || err?.message === 'DAILY_LIMIT_REACHED') {
        setLocked(true);
        localStorage.setItem(key, '5');
        showToast('已达到点赞上限 (5/5)', 'warning');
      } else {
        // 回滚本地计数
        localStorage.setItem(key, String(currentLocal));
        setCount(c => Math.max(0, c - 1));
        console.error('Failed to toggle like:', err);
      }
    }
  };

  // Helpers for rendering Apple-like visuals
  const localKey = localContentKey.current;

  return (
    <div className="relative inline-block">
      {ripples.map(r => (
        <span key={r.id} className="apple-ripple" />
      ))}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            style={{ position: 'absolute', top: toastLayout?.top ?? 0, left: toastLayout?.left ?? 0, zIndex: 9999 }}
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
          >
            <div ref={toastRef} className="apple-toast">{toast.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button onClick={handleLike} ref={buttonRef} className={`group rounded-full ${className}`} style={{ padding: isMobile ? '6px' : '8px 12px' }} aria-label={locked ? '已达到点赞上限 (5/5)' : `点赞 (${count})`}>
        <motion.svg
          width={isMobile ? 20 : 24}
          height={isMobile ? 20 : 24}
          viewBox="0 0 24 24"
          fill={pulse ? '#e11d48' : 'none'}
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </motion.svg>
        <span className="ml-2">{count}</span>
      </motion.button>

      {burst && (
        <motion.div className="apple-burst" initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.3 }} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor" className="text-rose-400/80">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}
