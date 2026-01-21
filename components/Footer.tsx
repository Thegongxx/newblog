import { motion } from 'framer-motion';
import { CONTACT_INFO } from '../constants';
import { useIsMobile } from '../hooks/useResponsive';
import { haptics } from '../utils/haptics';
import { useState } from 'react';

interface FooterProps {
    className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
    const isMobile = useIsMobile();
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' as 'success' | 'info' | 'error' });

    const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), isMobile ? 3000 : 2500);

        // 触发全局 Toast 事件
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('xuan:toast', {
                detail: { message: msg, type }
            }));
        }
    };

    const handleCopy = async (text: string, label: string) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                showToast(`${label} 已复制到剪贴板`);
                if (isMobile) {
                    haptics.success();
                }
                return;
            }

            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            textArea.style.top = '-9999px';
            textArea.style.opacity = '0';
            textArea.setAttribute('readonly', '');
            document.body.appendChild(textArea);

            if (isMobile) {
                textArea.style.position = 'absolute';
                textArea.style.left = '0';
                textArea.style.top = '0';
                textArea.style.width = '1px';
                textArea.style.height = '1px';
                textArea.style.padding = '0';
                textArea.style.border = 'none';
                textArea.style.outline = 'none';
                textArea.style.boxShadow = 'none';
                textArea.style.background = 'transparent';
            }

            textArea.focus();
            textArea.select();
            textArea.setSelectionRange(0, 99999);

            const success = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (success) {
                showToast(`${label} 已复制到剪贴板`);
                if (isMobile) {
                    haptics.success();
                }
            } else {
                if (isMobile) {
                    showToast(`${label}: ${text}`, 'info');
                } else {
                    showToast('复制失败，请手动复制', 'error');
                }
            }
        } catch (error) {
            console.error('Copy failed:', error);
            if (isMobile) {
                showToast(`${label}: ${text}`, 'info');
            } else {
                showToast('复制失败，请手动复制', 'error');
            }
        }
    };

    return (
        <footer className={`py-12 md:py-32 px-4 md:px-6 border-t border-white/10 ${className}`}>
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                <div className="text-2xl md:text-5xl mb-6 md:mb-16 font-bold tracking-tighter opacity-20 select-none">
                    XUAN
                </div>

                {/* 联系方式 */}
                <div className="flex gap-6 md:gap-12 text-xs md:text-sm uppercase tracking-wider font-bold text-white/60">
                    {[
                        { label: 'QQ', value: CONTACT_INFO.QQ },
                        { label: 'WX', value: CONTACT_INFO.WX },
                        { label: 'MAIL', value: CONTACT_INFO.MAIL }
                    ].map((contact) => (
                        <button
                            key={contact.label}
                            onClick={() => handleCopy(contact.value, contact.label)}
                            className="group relative overflow-hidden h-8 w-12 md:h-10 md:w-16 hover:text-white rounded-lg transition-colors duration-300"
                        >
                            <div className="absolute inset-0 flex items-center justify-center group-hover:-translate-y-full transition-transform duration-500">
                                {contact.label}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 text-white font-bold bg-white/10 rounded-lg text-[10px] md:text-xs">
                                COPY
                            </div>
                        </button>
                    ))}
                </div>

                <p className="mt-8 md:mt-24 text-[10px] md:text-xs text-white/20 tracking-wider uppercase">
                    Thank you for your coming
                </p>
            </div>
        </footer>
    );
}
