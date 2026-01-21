import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isMobile: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 简化的移动端检测，避免与 useResponsive 重复
const MOBILE_BREAKPOINT = 640;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [windowWidth, setWindowWidth] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth : 1024
    );

    // 使用 useMemo 计算 isMobile，减少不必要的重渲染
    const isMobile = useMemo(() => windowWidth < MOBILE_BREAKPOINT, [windowWidth]);

    // 监听窗口变化
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize, { passive: true });
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [theme, setTheme] = useState<Theme>(() => {
        // 移动端强制使用黑色主题
        if (typeof window !== 'undefined' && window.innerWidth < 640) {
            return 'dark';
        }

        const saved = localStorage.getItem('xuan-theme');
        return (saved as Theme) || 'dark';
    });

    useEffect(() => {
        // 移动端强制黑色主题，不保存到localStorage
        if (isMobile) {
            setTheme('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            localStorage.setItem('xuan-theme', theme);
            document.documentElement.setAttribute('data-theme', theme);
        }
    }, [theme, isMobile]);

    const toggleTheme = () => {
        // 移动端不允许切换主题
        if (isMobile) return;

        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isMobile }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
