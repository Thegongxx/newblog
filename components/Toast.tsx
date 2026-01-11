import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Z_INDEX } from '../constants/zIndex';
import { useIsMobile } from '../hooks/useResponsive';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const isMobile = useIsMobile();

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const colors = {
    success: 'bg-white/20 text-white border-white/20',
    error: 'bg-red-500/20 text-red-200 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
  };

  const dots = {
    success: 'bg-green-400',
    error: 'bg-red-400',
    info: 'bg-blue-400',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div 
        className={`fixed ${isMobile ? 'inset-x-4 top-4' : 'top-8 right-8'} flex flex-col gap-2`}
        style={{ zIndex: Z_INDEX.TOAST }}
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`px-6 py-4 rounded-2xl text-sm font-medium backdrop-blur-xl border shadow-2xl ${colors[toast.type]}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full animate-pulse ${dots[toast.type]}`} />
                {toast.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
