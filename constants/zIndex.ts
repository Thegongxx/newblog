// Z-Index 层级管理
export const Z_INDEX = {
  // 基础层级
  BASE: 0,
  DROPDOWN: 10,
  STICKY: 20,
  FIXED: 30,
  
  // 导航层级 - 移动端需要更高层级确保始终可见
  NAVIGATION: 9999, // 提高到最高层级，确保移动端始终可见
  BACK_BUTTON: 35, // 返回按钮在导航栏下面
  SCROLL_TO_TOP: 9998, // 滚动到顶部按钮，略低于导航栏但仍然很高
  
  // 弹窗层级
  MODAL_BACKDROP: 50,
  MODAL: 60,
  
  // 通知层级
  TOAST: 70,
  LIKE_TOAST: 99998, // 点赞提示最高优先级，确保显示在notes卡片上方
  
  // 全局效果层级
  RIPPLE: 99999, // 涟漪效果，在所有内容之上但低于点赞提示
  
  // AI助手层级 - 确保在移动端始终可见
  AI_ASSISTANT: 999, // 高层级，确保始终在右下角可见
  
  // 最高层级
  TOOLTIP: 80,
  LOADING: 90,
  DEBUG: 100
} as const;

export type ZIndexLevel = typeof Z_INDEX[keyof typeof Z_INDEX];