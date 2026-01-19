import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isMobile: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);
    
    // 检测移动端
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    const [theme, setTheme] = useState<Theme>(() => {
        // 移动端强制使用黑色主题
        if (typeof window !== 'undefined' && window.innerWidth < 640) {
            return 'dark';
        }
        
        const saved = localStorage.getItem('aura-theme');
        return (saved as Theme) || 'dark';
    });

    useEffect(() => {
        // 移动端强制黑色主题，不保存到localStorage
        if (isMobile) {
            setTheme('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            localStorage.setItem('aura-theme', theme);
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
