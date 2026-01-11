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
};

// 页面切换动画配置
export const pageTransitions = {
  // 淡入淡出 - 用于同级页面切换
  fade: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: {
      type: "tween",
      ease: easings.smooth,
      duration: 0.4
    }
  },

  // 从上方滑入 - 用于进入详情页
  slideDown: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 0, opacity: 0, scale: 0.98 },
    transition: {
      type: "tween",
      ease: easings.smooth,
      duration: 0.5
    }
  },

  // 从下方滑入 - 用于返回列表页
  slideUp: {
    initial: { y: '50%', opacity: 0, scale: 0.95 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: 0, opacity: 0, scale: 1.02 },
    transition: {
      type: "tween",
      ease: easings.smooth,
      duration: 0.5
    }
  },

  // 推拉效果 - 传统的左右切换
  push: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: {
      type: "tween",
      ease: easings.smooth,
      duration: 0.4
    }
  },

  // 缩放进入 - 用于特殊页面如About
  zoomIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
    transition: {
      type: "tween",
      ease: easings.gentle,
      duration: 0.6
    }
  },

  // 缩放退出
  zoomOut: {
    initial: { opacity: 0, scale: 1.1 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: {
      type: "tween",
      ease: easings.gentle,
      duration: 0.6
    }
  },

  // 旋转进入 - 特殊效果
  rotate: {
    initial: { opacity: 0, scale: 0.8, rotateY: -90 },
    animate: { opacity: 1, scale: 1, rotateY: 0 },
    exit: { opacity: 0, scale: 0.8, rotateY: 90 },
    transition: {
      type: "tween",
      ease: easings.bounce,
      duration: 0.7
    }
  },

  // 弹性进入
  elastic: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.3 },
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      duration: 0.8
    }
  }
} as const;

export type TransitionType = keyof typeof pageTransitions;

// 根据页面路径和导航方向智能选择动画
export const getSmartTransition = (
  fromPath: string, 
  toPath: string, 
  isBack: boolean = false
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

  // 详情页 ↔ 列表页
  if (fromDetail && toList) return 'slideUp';
  if (fromList && toDetail) return 'slideDown';
  
  // 静态页面
  if (toStatic) return 'zoomIn';
  if (fromStatic) return 'zoomOut';
  
  // 同级页面
  if ((fromList && toList) || (fromDetail && toDetail)) return 'fade';
  
  // 浏览器返回
  if (isBack) return 'slideUp';
  
  // 默认
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

// 获取过渡配置
export const getTransitionConfig = (transitionType: TransitionType) => {
  return pageTransitions[transitionType].transition;
};