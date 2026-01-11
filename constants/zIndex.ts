// Z-Index 层级管理
export const Z_INDEX = {
  // 基础层级
  BASE: 0,
  DROPDOWN: 10,
  STICKY: 20,
  FIXED: 30,
  
  // 导航层级
  NAVIGATION: 40,
  BACK_BUTTON: 35, // 返回按钮在导航栏下面
  
  // 弹窗层级
  MODAL_BACKDROP: 50,
  MODAL: 60,
  
  // 通知层级
  TOAST: 70,
  LIKE_TOAST: 9999, // 点赞提示最高优先级
  
  // AI助手层级
  AI_ASSISTANT: 35, // 在返回按钮之下
  
  // 最高层级
  TOOLTIP: 80,
  LOADING: 90,
  DEBUG: 100
} as const;

export type ZIndexLevel = typeof Z_INDEX[keyof typeof Z_INDEX];