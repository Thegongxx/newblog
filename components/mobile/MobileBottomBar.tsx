import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Z_INDEX } from '../../constants/zIndex';
import { APPLE_EASING } from '../../constants/animations';

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

interface MobileBottomBarProps {
    onNavigate: (path: string) => void;
}

const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ onNavigate }) => {
    const location = useLocation();
    const currentPath = location.pathname;

    const navItems: NavItem[] = useMemo(() => [
        {
            path: '/',
            label: 'Home',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            )
        },
        {
            path: '/notes',
            label: 'Notes',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
            )
        },
        {
            path: '/archive',
            label: 'Archive',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="21 8 21 21 3 21 3 8" />
                    <rect x="1" y="3" width="22" height="5" />
                    <line x1="10" y1="12" x2="14" y2="12" />
                </svg>
            )
        },
        {
            path: 'AI',
            label: 'AI',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                    <path d="M12 12L2.1 12.1" />
                    <path d="M12 12v10" />
                    <path d="M12 12l7.1-7.1" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            )
        },
        {
            path: '/about',
            label: 'About',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
            )
        }
    ], []);

    const activeIndex = useMemo(() => {
        const index = navItems.findIndex(item =>
            item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path)
        );
        return index === -1 ? 0 : index;
    }, [currentPath, navItems]);

    return (
        <div
            className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 z-50 pointer-events-none"
            style={{ zIndex: Z_INDEX.NAVIGATION }}
        >
            <motion.nav
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="max-w-md mx-auto pointer-events-auto"
            >
                <div className="relative flex items-center justify-around py-3 px-2 rounded-[2.5rem] bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                    {/* Active Indicator Background */}
                    <motion.div
                        className="absolute h-12 rounded-full bg-white/10"
                        animate={{
                            x: `${activeIndex * 100}%`,
                            width: `${100 / navItems.length}%`
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                            mass: 0.8
                        }}
                        style={{
                            left: 0,
                            width: `${100 / navItems.length}%`,
                            margin: '0 4px',
                            scaleX: 0.9,
                        }}
                    />

                    {navItems.map((item, index) => {
                        const isActive = activeIndex === index;
                        const isAI = item.path === 'AI';

                        const handleClick = () => {
                            if (isAI) {
                                window.dispatchEvent(new CustomEvent('aura:toggle-assistant'));
                            } else {
                                onNavigate(item.path);
                            }
                        };

                        return (
                            <motion.button
                                key={item.path}
                                onClick={handleClick}
                                className="relative flex flex-col items-center justify-center flex-1 h-12 outline-none group"
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className={`transition-all duration-300 ${isActive ? 'text-white translate-y-[-2px]' : 'text-white/40'}`}>
                                    {item.icon}
                                </div>

                                <AnimatePresence>
                                    {isActive && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.5, y: 5 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.5, y: 5 }}
                                            className="absolute bottom-[-2px] text-[10px] font-bold tracking-widest text-white uppercase scale-75"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {/* Touch Area Expansion */}
                                <div className="absolute inset-0 rounded-full" />
                            </motion.button>
                        );
                    })}
                </div>
            </motion.nav>
        </div>
    );
};

export default MobileBottomBar;
