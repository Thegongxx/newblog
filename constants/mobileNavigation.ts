// 移动端导航栏人体工学优化常量
export const MOBILE_NAV_CONFIG = {
  // 触摸目标最小尺寸 (符合苹果和谷歌的人机界面指南)
  MIN_TOUCH_TARGET: 44, // 44px 是推荐的最小触摸目标尺寸
  
  // 导航栏尺寸优化
  CONTAINER: {
    PADDING_X: 20, // 增加水平内边距，提供更好的视觉平衡
    PADDING_Y: 12, // 增加垂直内边距，提供更舒适的触摸区域
    MIN_WIDTH: 240, // 增加最小宽度，确保内容不会过于拥挤
    BORDER_RADIUS: 24, // 圆角半径
  },
  
  // 文字和间距优化
  TYPOGRAPHY: {
    BRAND_SIZE: 16, // 品牌文字大小 (从14px增加到16px)
    NAV_ITEM_SIZE: 13, // 导航项文字大小 (从9px增加到13px)
    LETTER_SPACING: 0.5, // 字母间距，提高可读性
  },
  
  // 间距优化
  SPACING: {
    ITEMS_GAP: 6, // 导航项之间的间距 (从2px增加到6px)
    BRAND_NAV_GAP: 16, // 品牌和导航项之间的间距 (从12px增加到16px)
  },
  
  // 边框和视觉效果优化
  VISUAL: {
    BORDER_WIDTH: 0.5, // 减小边框宽度，更精致
    BORDER_OPACITY: 0.06, // 降低边框透明度，更柔和
    SHADOW_OPACITY: 0.25, // 阴影透明度
    BACKDROP_BLUR: 20, // 背景模糊度
  },
  
  // 触摸反馈优化
  INTERACTION: {
    SCALE_DOWN: 0.95, // 按下时的缩放比例
    TRANSITION_DURATION: 150, // 过渡动画时长 (ms)
    HOVER_BG_OPACITY: 0.08, // 悬停背景透明度
  }
};

// 计算响应式尺寸的辅助函数
export const getMobileNavStyles = (isMobile: boolean) => {
  if (!isMobile) return {};
  
  return {
    container: {
      paddingLeft: `${MOBILE_NAV_CONFIG.CONTAINER.PADDING_X}px`,
      paddingRight: `${MOBILE_NAV_CONFIG.CONTAINER.PADDING_X}px`,
      paddingTop: `${MOBILE_NAV_CONFIG.CONTAINER.PADDING_Y}px`,
      paddingBottom: `${MOBILE_NAV_CONFIG.CONTAINER.PADDING_Y}px`,
      minWidth: `${MOBILE_NAV_CONFIG.CONTAINER.MIN_WIDTH}px`,
      borderRadius: `${MOBILE_NAV_CONFIG.CONTAINER.BORDER_RADIUS}px`,
      borderWidth: `${MOBILE_NAV_CONFIG.VISUAL.BORDER_WIDTH}px`,
    },
    brand: {
      fontSize: `${MOBILE_NAV_CONFIG.TYPOGRAPHY.BRAND_SIZE}px`,
      letterSpacing: `${MOBILE_NAV_CONFIG.TYPOGRAPHY.LETTER_SPACING}px`,
    },
    navItem: {
      fontSize: `${MOBILE_NAV_CONFIG.TYPOGRAPHY.NAV_ITEM_SIZE}px`,
      minWidth: `${MOBILE_NAV_CONFIG.MIN_TOUCH_TARGET}px`,
      minHeight: `${MOBILE_NAV_CONFIG.MIN_TOUCH_TARGET}px`,
      letterSpacing: `${MOBILE_NAV_CONFIG.TYPOGRAPHY.LETTER_SPACING}px`,
    },
    spacing: {
      itemsGap: `${MOBILE_NAV_CONFIG.SPACING.ITEMS_GAP}px`,
      brandNavGap: `${MOBILE_NAV_CONFIG.SPACING.BRAND_NAV_GAP}px`,
    }
  };
};