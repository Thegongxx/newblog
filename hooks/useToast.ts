import { useState, useCallback, useRef } from 'react';

interface ToastState {
  show: boolean;
  msg: string;
  type?: 'success' | 'error' | 'info';
}

export const useToast = (defaultDuration = 2500) => {
  const [toast, setToast] = useState<ToastState>({ show: false, msg: '' });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((
    msg: string, 
    type: 'success' | 'error' | 'info' = 'success',
    duration = defaultDuration
  ) => {
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({ show: true, msg, type });

    timeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, duration);
  }, [defaultDuration]);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  // 清理函数
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    toast,
    showToast,
    hideToast,
    cleanup
  };
};