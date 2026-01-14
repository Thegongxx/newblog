import { useCallback } from 'react';

type ToastType = 'success' | 'info' | 'error';

interface ToastController {
  showToast: (message: string, type?: ToastType) => void;
}

/**
 * 轻量封装 App 内全局 Toast 逻辑的 Hook。
 * 通过自定义事件与顶层 AppInner 中的 toast 状态通讯，
 * 避免在每个组件里重复实现 Toast UI。
 */
export const useToast = (): ToastController => {
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    if (typeof window === 'undefined') return;

    const event = new CustomEvent('aura:toast', {
      detail: { message, type },
    });

    window.dispatchEvent(event);
  }, []);

  return { showToast };
};

