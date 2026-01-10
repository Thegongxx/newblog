/**
 * 极简 loading fallback - 路由切换时几乎不可见
 * 只在组件加载超过 150ms 时才显示淡入的加载指示器
 */
import { useState, useEffect } from 'react';

const LoadingFallback = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 延迟显示，避免快速切换时闪烁
    const timer = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="min-h-[40vh] flex items-center justify-center opacity-30">
      <div className="w-1 h-1 rounded-full bg-white/50 animate-pulse" />
    </div>
  );
};

export default LoadingFallback;
