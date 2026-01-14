// 苹果风格动画常量
export const APPLE_EASING = {
    spring: {
        type: "spring" as const,
        stiffness: 400,
        damping: 30,
        mass: 0.8
    },
    springMobile: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        mass: 0.8
    },
    springDesktop: {
        type: "spring" as const,
        stiffness: 400,
        damping: 35,
        mass: 1
    },
    ease: [0.25, 0.46, 0.45, 0.94] as const,
    easeIn: [0.42, 0, 1, 1] as const,
    easeOut: [0, 0, 0.58, 1] as const,
    easeInOut: [0.42, 0, 0.58, 1] as const
};

// 动画持续时间
export const ANIMATION_DURATION = {
    fast: 0.2,
    normal: 0.35,
    slow: 0.5
};

// 页面切换动画变体（移动端）
export const MOBILE_PAGE_VARIANTS = {
    slideRight: {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '-30%', opacity: 0 }
    },
    slideLeft: {
        initial: { x: '-100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '30%', opacity: 0 }
    },
    fade: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    },
    zoomIn: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.1 }
    }
};

// 页面切换动画变体（桌面端）
export const DESKTOP_PAGE_VARIANTS = {
    slideDown: {
        initial: { y: '-100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '30%', opacity: 0 }
    },
    slideUp: {
        initial: { y: '100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '-30%', opacity: 0 }
    },
    fade: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    },
    zoomIn: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.05 }
    }
};
