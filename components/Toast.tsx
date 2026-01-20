import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Z_INDEX } from '../constants/zIndex';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type, visible, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [visible, duration, onClose]);

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
                    border: 'border-green-500/40',
                    text: 'text-green-100',
                    icon: '✨'
                };
            case 'error':
                return {
                    bg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
                    border: 'border-red-500/40',
                    text: 'text-red-100',
                    icon: '⚠️'
                };
            case 'info':
            default:
                return {
                    bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
                    border: 'border-blue-500/40',
                    text: 'text-blue-100',
                    icon: 'ℹ️'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed top-6 right-6 z-50 pointer-events-auto"
                    style={{ zIndex: Z_INDEX.TOAST }}
                    initial={{ opacity: 0, x: 100, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 100, scale: 0.9 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        duration: 0.4
                    }}
                >
                    <div className={`
                        relative max-w-sm p-4 rounded-2xl backdrop-blur-xl border shadow-2xl
                        ${styles.bg} ${styles.border}
                    `}>
                        <div className="flex items-start gap-3">
                            <span className="text-lg flex-shrink-0 mt-0.5">
                                {styles.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium leading-relaxed ${styles.text}`}>
                                    {message}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="flex-shrink-0 ml-2 text-white/40 hover:text-white/80 transition-colors duration-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Progress bar */}
                        <motion.div
                            className="absolute bottom-0 left-0 h-1 bg-white/20 rounded-b-2xl"
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: duration / 1000, ease: 'linear' }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Hook for using toast
export function useToast() {
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
        visible: boolean;
    }>({
        message: '',
        type: 'info',
        visible: false
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type, visible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, visible: false }));
    };

    const ToastComponent = () => (
        <Toast
            message={toast.message}
            type={toast.type}
            visible={toast.visible}
            onClose={hideToast}
        />
    );

    return { showToast, ToastComponent };
}