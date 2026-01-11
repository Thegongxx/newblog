import { useState, useEffect, useMemo } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

// 与 Tailwind 断点保持一致，避免冲突
const BREAKPOINTS = { mobile: 640, tablet: 768, desktop: 1024 };

// 防抖hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    // 初始化时直接计算，避免闪烁
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      return w < BREAKPOINTS.mobile ? 'mobile' : 
             w < BREAKPOINTS.tablet ? 'tablet' : 
             w < BREAKPOINTS.desktop ? 'tablet' : 'desktop';
    }
    return 'desktop';
  });

  // 防抖处理resize事件，减少频繁更新
  const [windowWidth, setWindowWidth] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  
  const debouncedWidth = useDebounce(windowWidth, 150);

  useEffect(() => {
    const update = () => {
      setWindowWidth(window.innerWidth);
    };

    // 使用passive监听器提升性能
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const newBreakpoint = debouncedWidth < BREAKPOINTS.mobile ? 'mobile' : 
                         debouncedWidth < BREAKPOINTS.tablet ? 'tablet' : 
                         debouncedWidth < BREAKPOINTS.desktop ? 'tablet' : 'desktop';
    setBreakpoint(newBreakpoint);
  }, [debouncedWidth]);

  return breakpoint;
}

export function useIsMobile(): boolean {
  const breakpoint = useBreakpoint();
  return useMemo(() => breakpoint === 'mobile', [breakpoint]);
}

export function useIsTablet(): boolean {
  const breakpoint = useBreakpoint();
  return useMemo(() => breakpoint === 'tablet', [breakpoint]);
}

export function useGridColumns(): number {
  const breakpoint = useBreakpoint();
  return useMemo(() => {
    return breakpoint === 'mobile' ? 1 : breakpoint === 'tablet' ? 2 : 3;
  }, [breakpoint]);
}

// For testing
export function getGridColumns(width: number): number {
  return width < BREAKPOINTS.mobile ? 1 : 
         width < BREAKPOINTS.tablet ? 2 : 
         width < BREAKPOINTS.desktop ? 2 : 3;
}
