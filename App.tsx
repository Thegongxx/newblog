import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { SWRConfig } from 'swr';
import Intro from './components/Intro';
import Assistant from './components/Assistant';
import ErrorBoundary from './components/ErrorBoundary';
import { CONTACT_INFO } from './constants';
import { Z_INDEX } from './constants/zIndex';
import { usePostsCache, useNotesCache } from './services/cacheService';
import { useIsMobile } from './hooks/useResponsive';

// 直接导入所有页面组件 - 避免懒加载导致的首次切换延迟
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import Notes from './pages/Notes';
import NoteDetail from './pages/NoteDetail';
import About from './pages/About';
import Archive from './pages/Archive';

const AppInner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  
  const isMobile = useIsMobile();

  const { data: posts = [], isLoading: postsLoading, error: postsError } = usePostsCache();
  const { data: notes = [], isLoading: notesLoading, error: notesError } = useNotesCache();
  
  const loading = postsLoading || notesLoading;
  const error = postsError?.message || notesError?.message || null;

  // 滚动追踪 - 用于导航栏渐变，移动端优化
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 页面切换时滚动到顶部 - 移动端防闪烁优化
  useEffect(() => {
    // 移动端需要更长的延迟来避免闪烁
    const delay = isMobile ? 100 : 50;
    const timer = setTimeout(() => {
      // 移动端使用smooth，桌面端使用auto
      const behavior = isMobile ? 'smooth' : 'auto';
      window.scrollTo({ top: 0, behavior: behavior as ScrollBehavior });
    }, delay);
    
    return () => clearTimeout(timer);
  }, [location.pathname, isMobile]);

  const showToast = (msg: string, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      // 移动端优化：检查是否支持Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        showToast(`${label} 已复制到剪贴板`);
        return;
      }
      
      // 移动端降级方案：使用传统的 execCommand
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      
      // 移动端需要特殊处理
      if (isMobile) {
        textArea.style.position = 'absolute';
        textArea.style.left = '0';
        textArea.style.top = '0';
        textArea.style.width = '1px';
        textArea.style.height = '1px';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
      }
      
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999); // 移动端兼容
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (success) {
        showToast(`${label} 已复制到剪贴板`);
      } else {
        // 移动端最终降级：显示文本让用户手动复制
        if (isMobile) {
          showToast(`${label}: ${text}`, 'info');
        } else {
          showToast('复制失败，请手动复制', 'error');
        }
      }
    } catch (error) {
      console.error('Copy failed:', error);
      // 移动端错误处理：显示文本内容
      if (isMobile) {
        showToast(`${label}: ${text}`, 'info');
      } else {
        showToast('复制失败，请手动复制', 'error');
      }
    }
  };

  const handleNavigate = (path: string) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    navigate(path);
  };

  if (showIntro && location.pathname === '/') {
    return <Intro onComplete={() => setShowIntro(false)} />;
  }

  // 导航栏渐变计算 - 移动端优化
  const scrollProgress = Math.min(scrollY / (isMobile ? 60 : 80), 1);
  const navOpacity = 0.02 + scrollProgress * (isMobile ? 0.3 : 0.4);
  const navBlur = isMobile ? 8 + scrollProgress * 8 : 20 + scrollProgress * 20;
  const navBorder = scrollProgress * (isMobile ? 0.1 : 0.15);
  const navShadow = scrollProgress * (isMobile ? 0.2 : 0.3);

  return (
    <div className="min-h-screen selection:bg-white/20 selection:text-white isolate">
      <Helmet>
        <title>Aura - 极简主义个人空间</title>
        <meta name="description" content="A digital sanctuary for minimalist aesthetics and intelligence." />
      </Helmet>

      {/* Toast - 移动端优化 */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`fixed ${isMobile ? 'inset-x-4 top-4' : 'top-8 right-8'} pointer-events-none`}
            style={{ zIndex: Z_INDEX.TOAST }}
          >
            <div className={`${isMobile ? 'w-full' : 'max-w-sm'} px-4 py-3 rounded-xl text-sm font-medium border shadow-2xl backdrop-blur-xl ${
              toast.type === 'error' 
                ? 'bg-red-500/90 text-white border-red-400/50' 
                : toast.type === 'info'
                ? 'bg-blue-500/90 text-white border-blue-400/50'
                : 'bg-green-500/90 text-white border-green-400/50'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                  toast.type === 'error' ? 'bg-red-300' : 
                  toast.type === 'info' ? 'bg-blue-300' : 'bg-green-300'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="break-words">{toast.msg}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation - 移动端简化版 */}
      <motion.nav 
        className={`fixed top-0 left-0 right-0 ${isMobile ? 'px-4 pt-3' : 'flex justify-center pt-6 px-4'}`}
        style={{ zIndex: Z_INDEX.NAVIGATION }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {isMobile ? (
          // 移动端极简导航
          <div 
            className="flex items-center justify-between py-3 px-4 rounded-full bg-black/20 backdrop-blur-md border border-white/10"
            style={{
              transition: 'all 0.3s ease-out',
            }}
          >
            <motion.button 
              onClick={() => navigate('/')}
              className="text-lg font-bold tracking-tight text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              AURA
            </motion.button>
            
            <div className="flex gap-4 text-xs font-medium">
              {[
                { path: '/notes', label: 'Notes' },
                { path: '/archive', label: 'Archive' },
                { path: '/about', label: 'About' }
              ].map((item) => (
                <motion.button 
                  key={item.path}
                  onClick={() => handleNavigate(item.path)} 
                  className={`px-2 py-1 rounded-full transition-all duration-200 ${
                    location.pathname === item.path 
                      ? 'text-white bg-white/20' 
                      : 'text-white/60'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          // 桌面端完整导航
          <motion.div 
            className="relative rounded-full px-10 py-3"
            style={{ 
              backgroundColor: `rgba(0, 0, 0, ${navOpacity})`,
              backdropFilter: `blur(${navBlur}px) saturate(${150 + scrollProgress * 30}%)`,
              boxShadow: scrollProgress > 0.2 ? `0 8px 32px rgba(0, 0, 0, ${navShadow})` : 'none',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: `rgba(255, 255, 255, ${navBorder})`,
              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative flex items-center gap-12">
              <motion.button 
                onClick={() => navigate('/')}
                className="text-lg font-bold tracking-tight text-white/90 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                AURA
              </motion.button>
              
              <div className="flex gap-6 text-sm font-medium">
                {[
                  { path: '/notes', label: 'Notes' },
                  { path: '/archive', label: 'Archive' },
                  { path: '/about', label: 'About' }
                ].map((item) => (
                  <motion.button 
                    key={item.path}
                    onClick={() => handleNavigate(item.path)} 
                    className={`px-4 py-2 rounded-full transition-all duration-200 ${
                      location.pathname === item.path 
                        ? 'text-white bg-white/15' 
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Main Content - 移动端优化布局，添加页面切换容器 */}
      <motion.main 
        className={`${isMobile ? 'pt-16 pb-16 px-4' : 'pt-32 pb-48 px-6'} max-w-7xl mx-auto`}
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)'
        }}
        layout={isMobile} // 移动端启用布局动画
      >
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <motion.div
                  initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: isMobile ? -10 : -20 }}
                  transition={{ 
                    duration: isMobile ? 0.4 : 0.6, 
                    ease: [0.4, 0.0, 0.2, 1] 
                  }}
                >
                  <Feed posts={posts} loading={loading} onSelectPost={(p) => navigate(`/post/${p.slug}`)} />
                </motion.div>
              } />
              <Route path="/post/:slug" element={
                <motion.div
                  initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: isMobile ? -10 : -20 }}
                  transition={{ 
                    duration: isMobile ? 0.4 : 0.6, 
                    ease: [0.4, 0.0, 0.2, 1] 
                  }}
                >
                  <PostDetail posts={posts} loading={loading} />
                </motion.div>
              } />
              <Route path="/notes" element={
                <motion.div
                  initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: isMobile ? -10 : -20 }}
                  transition={{ 
                    duration: isMobile ? 0.4 : 0.6, 
                    ease: [0.4, 0.0, 0.2, 1] 
                  }}
                >
                  <Notes notes={notes} loading={loading} />
                </motion.div>
              } />
              <Route path="/note/:id" element={
                <motion.div
                  initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: isMobile ? -10 : -20 }}
                  transition={{ 
                    duration: isMobile ? 0.4 : 0.6, 
                    ease: [0.4, 0.0, 0.2, 1] 
                  }}
                >
                  <NoteDetail />
                </motion.div>
              } />
              <Route path="/archive" element={
                <motion.div
                  initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: isMobile ? -10 : -20 }}
                  transition={{ 
                    duration: isMobile ? 0.4 : 0.6, 
                    ease: [0.4, 0.0, 0.2, 1] 
                  }}
                >
                  <Archive posts={posts} loading={loading} onSelectPost={(p) => navigate(`/post/${p.slug}`)} />
                </motion.div>
              } />
              <Route path="/about" element={
                <motion.div
                  initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: isMobile ? -10 : -20 }}
                  transition={{ 
                    duration: isMobile ? 0.4 : 0.6, 
                    ease: [0.4, 0.0, 0.2, 1] 
                  }}
                >
                  <About />
                </motion.div>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </ErrorBoundary>
      </motion.main>

      <Assistant />

      {/* Footer - 移动端优化 */}
      <footer className={`${isMobile ? 'py-12 px-4' : 'py-32 px-6'} border-t border-white/10`}>
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className={`${isMobile ? 'text-2xl mb-6' : 'text-5xl mb-16'} font-bold tracking-tighter opacity-20 select-none`}>
            AURA
          </div>
          
          {isMobile ? (
            // 移动端恢复翻转效果
            <div className="flex gap-6 text-xs uppercase tracking-wider font-bold text-white/60">
              {[
                { label: 'QQ', value: CONTACT_INFO.QQ },
                { label: 'WX', value: CONTACT_INFO.WX },
                { label: 'MAIL', value: CONTACT_INFO.MAIL }
              ].map((contact) => (
                <button
                  key={contact.label}
                  onClick={() => handleCopy(contact.value, contact.label)}
                  className="group relative overflow-hidden h-10 w-16 hover:text-white rounded-lg"
                >
                  <div className="absolute inset-0 flex items-center justify-center group-hover:-translate-y-full transition-transform duration-500">
                    {contact.label}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 text-white font-bold bg-white/10 rounded-lg">
                    COPY
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // 桌面端完整版联系方式
            <div className="flex gap-12 text-sm uppercase tracking-wider font-bold text-white/60">
              {[
                { label: 'QQ', value: CONTACT_INFO.QQ },
                { label: 'WX', value: CONTACT_INFO.WX },
                { label: 'MAIL', value: CONTACT_INFO.MAIL }
              ].map((contact) => (
                <button
                  key={contact.label}
                  onClick={() => handleCopy(contact.value, contact.label)}
                  className="group relative overflow-hidden h-12 w-20 hover:text-white rounded-lg"
                >
                  <div className="absolute inset-0 flex items-center justify-center group-hover:-translate-y-full transition-transform duration-500">
                    {contact.label}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 text-white font-bold bg-white/10 rounded-lg">
                    COPY
                  </div>
                </button>
              ))}
            </div>
          )}
          
          <p className={`${isMobile ? 'mt-8 text-[10px]' : 'mt-24 text-xs'} text-white/20 tracking-wider uppercase`}>
            Designed for clarity © 2024
          </p>
        </div>
      </footer>

      {error && (
        <div className="fixed bottom-4 left-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

const App = () => (
  <HelmetProvider>
    <SWRConfig value={{ revalidateOnFocus: false, errorRetryCount: 3 }}>
      <Router>
        <AppInner />
      </Router>
    </SWRConfig>
  </HelmetProvider>
);

export default App;
