import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  TransitionType, 
  TransitionConfig, 
  pageTransitions, 
  getSmartTransition,
  getTransitionConfig
} from '../utils/pageTransitions';
import { useIsMobile } from './useResponsive';

export const usePageTransition = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [navigationMethod, setNavigationMethod] = useState<TransitionType>('fade');
  const [currentScrollPosition, setCurrentScrollPosition] = useState(0);
  const previousLocation = useRef(location.pathname);
  const navigationHistory = useRef<string[]>([]);
  const isManualNavigation = useRef(false);

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousLocation.current;
    
    // 记录导航历史
    if (previousPath !== currentPath) {
      navigationHistory.current.push(currentPath);
      if (navigationHistory.current.length > 10) {
        navigationHistory.current = navigationHistory.current.slice(-10);
      }
    }
    
    // 记录当前滚动位置
    setCurrentScrollPosition(window.scrollY);
    
    // 智能判断导航方式
    if (previousPath !== currentPath && !isManualNavigation.current) {
      const isBack = navigationHistory.current.includes(currentPath) && 
                    navigationHistory.current.indexOf(currentPath) < navigationHistory.current.indexOf(previousPath);
      
      const method = getSmartTransition(previousPath, currentPath, isBack, isMobile);
      setNavigationMethod(method);
    }
    
    // 重置手动导航标志
    isManualNavigation.current = false;
    previousLocation.current = currentPath;
  }, [location.pathname, isMobile]);

  const getPageTransition = (): TransitionConfig => {
    const config = pageTransitions[navigationMethod];
    const transition = getTransitionConfig(navigationMethod, isMobile);
    
    return {
      initial: config.initial,
      animate: config.animate,
      exit: config.exit,
      transition: transition
    };
  };

  const setCustomNavigationMethod = (method: TransitionType) => {
    isManualNavigation.current = true;
    setNavigationMethod(method);
  };

  return {
    navigationMethod,
    currentScrollPosition,
    getPageTransition,
    setNavigationMethod: setCustomNavigationMethod,
    isMobile
  };
};