import { useState, useEffect } from 'react';
import { useIsMobile } from './useResponsive';

export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced || isMobile;
}

export function useShouldAnimate(): boolean {
  return !useReducedMotion();
}
