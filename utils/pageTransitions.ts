import { Variants } from 'framer-motion';

export interface TransitionConfig {
  initial: Record<string, any>;
  animate: Record<string, any>;
  exit: Record<string, any>;
  transition: Record<string, any>;
}

// 基础缓动函数
export const easings = {
  smooth: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  bounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
  sharp: [0.4, 0, 0.2, 1] as [number, number, number, number],
  gentle: [0.16, 1, 0.3, 1] as [number, number, number, number],
  mobile: [0.2, 0, 0.2, 1] as [number, number, number, number], // 移动端专用
};

// 移动端优化的动画配置
const getMobileTransition = (duration: number) => ({
  type: "tween" as const,
  ease: easings.mobile,
  duration: duration * 0.8, // 移动端动画更快
});

const getDesktopTransition = (duration: number) => ({
  type: "tween" as const,
  ease: easings.smooth,
  duration: duration,
});

// 页面切换动画配置
export const pageTransitions = {
  // 淡入淡出 - 用于同级页面切换
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      desktop: getDesktopTransition(0.3),
      mobile: getMobileTransition(0.3)
    }
  },

  // 从上方滑入 - 用于进入详情页
  slideDown: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 0, opacity: 0 },
    transition: {
      desktop: getDesktopTransition(0.4),
      mobile: getMobileTransition(0.35) // 移动端稍快
    }
  },

  // 从下方滑入 - 用于返回列表页
  slideUp: {
    initial: { y: '30%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 0, opacity: 0 },
    transition: {
      desktop: getDesktopTransition(0.4),
      mobile: getMobileTransition(0.35)
    }
  },

  // 推拉效果 - 传统的左右切换
  push: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: {
      desktop: getDesktopTransition(0.3),
      mobile: getMobileTransition(0.25) // 移动端更快的推拉
    }
  },

  // 缩放进入 - 用于特殊页面如About
  zoomIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
    transition: {
      desktop: getDesktopTransition(0.4),
      mobile: getMobileTransition(0.3)
    }
  },

  // 缩放退出
  zoomOut: {
    initial: { opacity: 0, scale: 1.05 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: {
      desktop: getDesktopTransition(0.4),
      mobile: getMobileTransition(0.3)
    }
  },

  // 移动端专用 - 从右侧滑入（类似原生App）
  slideRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-30%', opacity: 0, scale: 0.95 },
    transition: {
      desktop: getDesktopTransition(0.3),
      mobile: getMobileTransition(0.25)
    }
  },

  // 移动端专用 - 从左侧滑入（返回效果）
  slideLeft: {
    initial: { x: '-30%', opacity: 0, scale: 0.95 },
    animate: { x: 0, opacity: 1, scale: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: {
      desktop: getDesktopTransition(0.3),
      mobile: getMobileTransition(0.25)
    }
  },

  // 旋转进入 - 特殊效果
  rotate: {
    initial: { opacity: 0, scale: 0.8, rotateY: -90 },
    animate: { opacity: 1, scale: 1, rotateY: 0 },
    exit: { opacity: 0, scale: 0.8, rotateY: 90 },
    transition: {
      desktop: getDesktopTransition(0.5),
      mobile: getMobileTransition(0.4)
    }
  },

  // 弹性进入
  elastic: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.3 },
    transition: {
      desktop: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.6
      },
      mobile: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.4
      }
    }
  }
} as const;

export type TransitionType = keyof typeof pageTransitions;

// 根据页面路径和导航方向智能选择动画（移动端优化）
export const getSmartTransition = (
  fromPath: string, 
  toPath: string, 
  isBack: boolean = false,
  isMobile: boolean = false
): TransitionType => {
  const isDetailPage = (path: string) => path.includes('/post/') || path.includes('/note/');
  const isListPage = (path: string) => ['/', '/notes', '/archive'].includes(path);
  const isStaticPage = (path: string) => ['/about'].includes(path);
  
  const fromDetail = isDetailPage(fromPath);
  const toDetail = isDetailPage(toPath);
  const fromList = isListPage(fromPath);
  const toList = isListPage(toPath);
  const fromStatic = isStaticPage(fromPath);
  const toStatic = isStaticPage(toPath);

  // 移动端使用原生App风格的左右滑动
  if (isMobile) {
    if (isBack || (fromDetail && toList)) return 'slideLeft';
    if (fromList && toDetail) return 'slideRight';
    if (toStatic) return 'zoomIn';
    if (fromStatic) return 'zoomOut';
    if ((fromList && toList) || (fromDetail && toDetail)) return 'fade';
    return 'slideRight';
  }

  // 桌面端保持原有逻辑
  if (fromDetail && toList) return 'slideUp';
  if (fromList && toDetail) return 'slideDown';
  if (toStatic) return 'zoomIn';
  if (fromStatic) return 'zoomOut';
  if ((fromList && toList) || (fromDetail && toDetail)) return 'fade';
  if (isBack) return 'slideUp';
  
  return 'push';
};

// 页面切换的变体动画
export const createPageVariants = (transitionType: TransitionType): Variants => {
  const config = pageTransitions[transitionType];
  
  return {
    initial: config.initial,
    animate: config.animate,
    exit: config.exit
  };
};

// 获取过渡配置（响应式）
export const getTransitionConfig = (transitionType: TransitionType, isMobile: boolean = false) => {
  const config = pageTransitions[transitionType];
  return isMobile ? config.transition.mobile : config.transition.desktop;
};