import React, { useState, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Intro from './components/Intro';
import Assistant from './components/Assistant';
import Navigation from './components/Navigation';
import Toast from './components/Toast';
import Archive from './components/Archive';
import { CONTACT_INFO } from './constants';
import { useOptimizedEventListeners } from './hooks/useOptimizedEventListeners';
import { useDataFetching } from './hooks/useDataFetching';
import { useToast } from './hooks/useToast';

// Pages - 懒加载优化
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import Notes from './pages/Notes';
import About from './pages/About';

const Admin = React.lazy(() => import('./components/Admin'));

// 联系信息配置
const contactInfo = [
  { id: 'qq' as const, label: 'QQ', value: CONTACT_INFO.QQ },
  { id: 'wx' as const, label: 'WX', value: CONTACT_INFO.WX },
  { id: 'mail' as const, label: 'MAIL', value: CONTACT_INFO.MAIL }
];

const AppInner: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  
  // 使用优化的数据获取Hook
  const { posts, notes, loading, error, refetch } = useDataFetching();
  
  // 使用优化的Toast Hook
  const { toast, showToast, cleanup } = useToast();

  // 鼠标位置处理
  const handleMouseMove = useCallback((x: number, y: number) => {
    document.documentElement.style.setProperty('--mouse-x', `${x}%`);
    document.documentElement.style.setProperty('--mouse-y', `${y}%`);
  }, []);

  // 键盘事件处理
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === ',') {
      e.preventDefault();
      navigate('/admin');
    }
  }, [navigate]);

  // 点击效果处理
  const handleMouseDown = useCallback((e: MouseEvent) => {
    const glimmer = document.createElement('div');
    glimmer.className = 'click-glimmer';
    glimmer.style.left = `${e.clientX}px`;
    glimmer.style.top = `${e.clientY}px`;
    document.body.appendChild(glimmer);
    setTimeout(() => glimmer.remove(), 600);
  }, []);

  // 使用优化的事件监听器
  useOptimizedEventListeners({
    onScroll: setScrolled,
    onMouseMove: handleMouseMove,
    onKeyDown: handleKeyDown
  });

  // 复制处理函数
  const handleCopy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} 已复制到剪贴板`);
    } catch (err) {
      console.error('复制失败:', err);
      showToast('复制失败', 'error');
    }
  }, [showToast]);

  // 搜索选择处理
  const handleSearchSelect = useCallback((result: any) => {
    navigate(result.url);
  }, [navigate]);

  // 合并搜索数据
  const searchData = useMemo(() => [...posts, ...notes], [posts, notes]);

  // 联系按钮组件
  const ContactButton = React.memo<{
    contact: { id: string; label: string; value: string };
    onCopy: (value: string, label: string) => void;
  }>(({ contact, onCopy }) => (
    <button
      onClick={() => onCopy(contact.value, contact.label)}
      className="group relative overflow-hidden h-8 w-[5em] md:w-[6em] focus:outline-none hover:text-white transition-colors duration-500 focus-ring"
      aria-label={`复制${contact.label}`}
    >
      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-y-full group-active:scale-90">
        {contact.label}
      </div>
      <div className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0 group-active:scale-90 text-white font-bold bg-white/5 rounded-lg">
        COPY
      </div>
    </button>
  ));

  // 清理副作用
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // 添加全局点击事件
  React.useEffect(() => {
    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [handleMouseDown]);

  if (showIntro && location.pathname === '/') {
    return <Intro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen selection:bg-white/20 selection:text-white">
      <Helmet>
        <title>Aura | Minimalist Personal Space</title>
        <meta name="description" content="A digital sanctuary for minimalist aesthetics and intelligence." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>

      {/* Toast通知 */}
      <Toast show={toast.show} message={toast.msg} type={toast.type} />

      {/* 导航栏 */}
      <Navigation scrolled={scrolled} />

      {/* 主内容区 */}
      <main className="relative z-10 pt-44 md:pt-56 pb-48 px-6 md:px-8 max-w-7xl mx-auto">
        <div className="view-transition">
          <React.Suspense 
            fallback={
              <div className="min-h-[60vh] flex items-center justify-center text-white/10 tracking-[0.5em] uppercase text-xs animate-pulse">
                Establishing Connection...
              </div>
            }
          >
            <Routes>
              <Route 
                path="/" 
                element={
                  <Feed 
                    posts={posts} 
                    loading={loading} 
                    onSelectPost={(p) => navigate(`/post/${p.slug}`)} 
                  />
                } 
              />
              <Route 
                path="/post/:slug" 
                element={<PostDetail posts={posts} loading={loading} />} 
              />
              <Route 
                path="/notes" 
                element={<Notes notes={notes} loading={loading} />} 
              />
              <Route 
                path="/archive" 
                element={<Archive posts={posts} loading={loading} />} 
              />
              <Route path="/about" element={<About />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </div>
      </main>

      {/* 滚动指示器 - 暂时移除 */}
      {/* <ScrollIndicator /> */}
      
      {/* 智能搜索 - 暂时移除 */}
      {/* <SmartSearch data={searchData} onSelect={handleSearchSelect} /> */}

      {/* AI助手 */}
      <Assistant />

      {/* 页脚 */}
      <footer className="relative z-10 py-24 md:py-40 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.01]">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="text-4xl font-bold tracking-tighter mb-12 opacity-10 select-none grayscale contrast-200">
            AURA
          </div>
          <div className="flex flex-row justify-center items-center gap-8 md:gap-20 text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">
            {contactInfo.map((contact) => (
              <ContactButton
                key={contact.id}
                contact={contact}
                onCopy={handleCopy}
              />
            ))}
          </div>
          <div className="mt-20 md:mt-32 space-y-4">
            <p className="text-[9px] text-white/5 tracking-[0.6em] uppercase font-medium">
              Designed for clarity &copy; 2024
            </p>
            <div className="w-8 h-[1px] bg-white/5 mx-auto" />
          </div>
        </div>
      </footer>

      {/* 错误提示 */}
      {error && (
        <div className="fixed bottom-4 left-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">
          {error}
          <button 
            onClick={refetch}
            className="ml-2 underline hover:no-underline"
          >
            重试
          </button>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Router>
        <AppInner />
      </Router>
    </HelmetProvider>
  );
};

export default App;