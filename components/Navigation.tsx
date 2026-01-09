import React, { memo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationProps {
  scrolled: boolean;
}

const navLinks = [
  { label: 'NOTES', path: '/notes' },
  { label: 'ARCHIVE', path: '/archive' },
  { label: 'ABOUT', path: '/about' }
] as const;

const NavigationButton = memo<{
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
}>(({ label, path, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-3 md:px-5 py-2.5 text-[9px] md:text-[11px] uppercase tracking-[0.2em] font-black rounded-full transition-all duration-500 active:scale-95 whitespace-nowrap focus-ring ${
      isActive 
        ? 'bg-white text-black shadow-lg' 
        : 'text-white/30 hover:text-white hover:bg-white/5'
    }`}
    aria-label={`导航到${label}页面`}
    aria-current={isActive ? 'page' : undefined}
  >
    {label}
  </button>
));

NavigationButton.displayName = 'NavigationButton';

const Navigation: React.FC<NavigationProps> = memo(({ scrolled }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/');
  }, [navigate]);

  const handleNavClick = useCallback((path: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(path);
  }, [navigate]);

  return (
    <nav 
      className={`fixed top-8 inset-x-0 z-[60] px-4 md:px-6 flex justify-center transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        scrolled ? 'translate-y-[-10px] scale-[0.96]' : 'translate-y-0'
      }`}
      role="navigation"
      aria-label="主导航"
    >
      <div className={`flex items-center gap-0.5 md:gap-1.5 p-1.5 md:p-2 rounded-full glass transition-all duration-1000 ${
        scrolled ? 'shadow-[0_40px_100px_rgba(0,0,0,0.7)] bg-black/50 border-white/15 backdrop-blur-[40px]' : ''
      }`}>
        {/* Home Button */}
        <button 
          onClick={handleHomeClick}
          className="group px-3 md:px-6 py-2.5 text-xs md:text-sm font-bold tracking-tight hover:bg-white/10 rounded-full transition-all duration-500 flex items-center gap-2 md:gap-3 active:scale-95 focus-ring"
          aria-label="返回首页"
        >
          <div className="relative w-2 h-2 md:w-2.5 md:h-2.5 flex-shrink-0">
            <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20 scale-150" />
            <div className="relative w-full h-full bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
          </div>
          <span className="group-hover:translate-x-0.5 transition-transform hidden xs:inline">
            Aura
          </span>
        </button>
        
        {/* Divider */}
        <div className="h-4 md:h-5 w-[1px] bg-white/10 mx-1 md:mx-2" />
        
        {/* Navigation Links */}
        {navLinks.map(item => (
          <NavigationButton
            key={item.path}
            label={item.label}
            path={item.path}
            isActive={location.pathname === item.path}
            onClick={() => handleNavClick(item.path)}
          />
        ))}
      </div>
    </nav>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;