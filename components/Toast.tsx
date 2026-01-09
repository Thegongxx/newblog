import React, { memo } from 'react';

interface ToastProps {
  show: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps> = memo(({ show, message, type = 'success' }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
      default:
        return '✓';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
      case 'error':
        return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
      case 'info':
        return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
      default:
        return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
    }
  };

  return (
    <div 
      className={`fixed top-12 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 rounded-full bg-[#1a1a1a]/60 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
        show ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className={`w-2 h-2 rounded-full ${getColors()}`}>
        <span className="sr-only">{getIcon()}</span>
      </div>
      <span className="text-xs font-medium tracking-wide text-white/90">
        {message}
      </span>
    </div>
  );
});

Toast.displayName = 'Toast';

export default Toast;