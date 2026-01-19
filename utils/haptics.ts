// 移动端震动反馈工具
export const haptics = {
  // 轻微震动 - 用于一般交互
  light: () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  },

  // 中等震动 - 用于重要操作
  medium: () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([15, 10, 15]);
    }
  },

  // 强震动 - 用于关键操作
  strong: () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([20, 15, 20, 15, 20]);
    }
  },

  // 成功震动 - 用于成功操作
  success: () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([10, 50, 10]);
    }
  },

  // 错误震动 - 用于错误提示
  error: () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([50, 25, 50, 25, 50]);
    }
  }
};

// 检查是否支持震动
export const supportsVibration = (): boolean => {
  return !!(window.navigator && window.navigator.vibrate);
};

// 检查是否为移动设备
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};