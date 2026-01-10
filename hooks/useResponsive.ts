import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const BREAKPOINTS = { mobile: 768, tablet: 1024 };

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setBreakpoint(w < BREAKPOINTS.mobile ? 'mobile' : w < BREAKPOINTS.tablet ? 'tablet' : 'desktop');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return breakpoint;
}

export function useIsMobile(): boolean {
  return useBreakpoint() === 'mobile';
}

export function useIsTablet(): boolean {
  return useBreakpoint() === 'tablet';
}

export function useGridColumns(): number {
  const bp = useBreakpoint();
  return bp === 'mobile' ? 1 : bp === 'tablet' ? 2 : 3;
}

// For testing
export function getGridColumns(width: number): number {
  return width < BREAKPOINTS.mobile ? 1 : width < BREAKPOINTS.tablet ? 2 : 3;
}
