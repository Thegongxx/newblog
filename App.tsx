import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { SWRConfig } from 'swr';
import Intro from './components/Intro';
import Assistant from './components/Assistant';
import ErrorBoundary from './components/ErrorBoundary';
import PageTransition from './components/PageTransition';
import MobilePageTransition from './components/MobilePageTransition';
import PageTransitionMask from './components/PageTransitionMask';
import { MagneticButton, RippleButton } from './components/HoverEffects';
import { CONTACT_INFO } from './constants';
import { Z_INDEX } from './constants/zIndex';
import { usePostsCache, useNotesCache } from './services/cacheService';
import { useIsMobile } from './hooks/useResponsive';
import { usePageTransition } from './hooks/usePageTransition';
import { useMobileOptimization } from './hooks/useMobileOptimization';

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
  
  // 使用页面切换动画 hook
  const { setNavigationMethod } = usePageTransition();
  
  const isMobile = useIsMobile();
  
  // 移动端优化
  useMobileOptimization();

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
    
    // 设置导航方式 - 移动端优化
    const currentPath = location.pathname;
    const isToDetail = path.includes('/post/') || path.includes('/note/');
    const isFromDetail = currentPath.includes('/post/') || currentPath.includes('/note/');
    const isToAbout = path === '/about';
    const isFromAbout = currentPath === '/about';
    
    if (isMobile) {
      // 移动端使用原生App风格的左右滑动
      if (isToDetail && !isFromDetail) {
        setNavigationMethod('slideRight');
      } else if (!isToDetail && isFromDetail) {
        setNavigationMethod('slideLeft');
      } else if (isToAbout || isFromAbout) {
        setNavigationMethod('zoomIn');
      } else {
        setNavigationMethod('fade');
      }
    } else {
      // 桌面端保持原有逻辑
      if (isToDetail && !isFromDetail) {
        setNavigationMethod('slideDown');
      } else if (!isToDetail && isFromDetail) {
        setNavigationMethod('slideUp');
      } else if (isToAbout || isFromAbout) {
        setNavigationMethod('zoomIn');
      } else {
        setNavigationMethod('fade');
      }
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

      {/* 页面切换遮罩 - 确保切换时不显示其他内容 */}
      <PageTransitionMask />

      {/* Toast - 苹果风格通知 */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 25,
              duration: 0.35
            }}
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

      {/* Navigation - iPhone灵动岛风格，固定在屏幕顶部 */}
      <motion.nav 
        className={`fixed top-0 left-0 right-0 ${isMobile ? 'px-4 pt-3' : 'flex justify-center pt-6 px-4'}`}
        style={{ 
          zIndex: Z_INDEX.NAVIGATION,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.6
        }}
      >
        {isMobile ? (
          // 移动端灵动岛风格导航 - 苹果风格交互
          <motion.div 
            className="flex items-center justify-between py-3 px-4 rounded-full bg-black/20 backdrop-blur-md border border-white/10 ripple-effect"
            style={{
              transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // 苹果标准缓动
              // 灵动岛效果：根据滚动动态调整透明度和模糊度
              backgroundColor: `rgba(0, 0, 0, ${Math.max(0.15, navOpacity * 0.8)})`,
              backdropFilter: `blur(${Math.max(8, navBlur * 0.6)}px) saturate(150%)`,
              borderColor: `rgba(255, 255, 255, ${Math.max(0.08, navBorder * 0.8)})`,
            }}
            whileHover={{ 
              scale: 1.02,
              y: -1,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 25,
                duration: 0.2
              }
            }}
            whileTap={{ 
              scale: 0.98,
              transition: {
                type: "spring",
                stiffness: 600,
                damping: 30,
                duration: 0.1
              }
            }}
          >
            <MagneticButton 
              onClick={() => navigate('/')}
              className="text-lg font-bold tracking-tight text-white"
              strength={0.2}
            >
              AURA
            </MagneticButton>
            
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
                  whileHover={{
                    scale: 1.05,
                    color: 'rgba(255, 255, 255, 1)',
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                      duration: 0.2
                    }
                  }}
                  whileTap={{
                    scale: 0.95,
                    transition: {
                      type: "spring",
                      stiffness: 600,
                      damping: 30,
                      duration: 0.1
                    }
                  }}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          // 桌面端苹果风格导航
          <motion.div 
            className="relative rounded-full px-10 py-3 magnetic-hover"
            style={{ 
              backgroundColor: `rgba(0, 0, 0, ${navOpacity})`,
              backdropFilter: `blur(${navBlur}px) saturate(${150 + scrollProgress * 30}%)`,
              boxShadow: scrollProgress > 0.2 ? `0 8px 32px rgba(0, 0, 0, ${navShadow})` : 'none',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: `rgba(255, 255, 255, ${navBorder})`,
              transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // 苹果标准缓动
            }}
            whileHover={{ 
              scale: 1.02, 
              y: -2,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 25,
                duration: 0.2
              }
            }}
            whileTap={{ 
              scale: 0.98,
              transition: {
                type: "spring",
                stiffness: 600,
                damping: 30,
                duration: 0.1
              }
            }}
          >
            <div className="relative flex items-center gap-12">
              <MagneticButton 
                onClick={() => navigate('/')}
                className="text-lg font-bold tracking-tight text-white/90 hover:text-white transition-all duration-300 relative overflow-hidden group"
                strength={0.3}
              >
                {/* 苹果风格的悬停背景光效 */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-sm" />
                <span className="relative z-10 group-hover:tracking-wider transition-all duration-300">AURA</span>
              </MagneticButton>
              
              <div className="flex gap-6 text-sm font-medium">
                {[
                  { path: '/notes', label: 'Notes' },
                  { path: '/archive', label: 'Archive' },
                  { path: '/about', label: 'About' }
                ].map((item) => (
                  <motion.button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)} 
                    className={`px-4 py-2 rounded-full transition-all duration-200 liquid-morph ${
                      location.pathname === item.path 
                        ? 'text-white bg-white/15' 
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{
                      scale: 1.05,
                      y: -1,
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        duration: 0.2
                      }
                    }}
                    whileTap={{
                      scale: 0.95,
                      transition: {
                        type: "spring",
                        stiffness: 600,
                        damping: 30,
                        duration: 0.1
                      }
                    }}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Main Content - 智能页面切换动画系统 */}
      <motion.main 
        className={`${isMobile ? 'pb-32 px-4 pt-20' : 'pb-48 px-6 pt-24'} max-w-7xl mx-auto relative`}
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
          // 确保主容器有最小高度，避免页面切换时的空白
          minHeight: 'calc(100vh - 8rem)',
          // 添加背景色确保切换时不会透出其他内容
          backgroundColor: 'transparent'
        }}
      >
        <ErrorBoundary>
          <AnimatePresence 
            mode="wait" 
            initial={false}
            onExitComplete={() => {
              // 确保退出动画完成后再进行滚动
              window.scrollTo(0, 0);
            }}
          >
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                isMobile ? (
                  <MobilePageTransition>
                    <Feed posts={posts} loading={loading} onSelectPost={(p) => {
                      setNavigationMethod('slideRight');
                      navigate(`/post/${p.slug}`, { state: { from: '/' } });
                    }} />
                  </MobilePageTransition>
                ) : (
                  <PageTransition>
                    <Feed posts={posts} loading={loading} onSelectPost={(p) => {
                      setNavigationMethod('slideDown');
                      navigate(`/post/${p.slug}`, { state: { from: '/' } });
                    }} />
                  </PageTransition>
                )
              } />
              <Route path="/post/:slug" element={
                isMobile ? (
                  <MobilePageTransition>
                    <PostDetail posts={posts} loading={loading} />
                  </MobilePageTransition>
                ) : (
                  <PageTransition>
                    <PostDetail posts={posts} loading={loading} />
                  </PageTransition>
                )
              } />
              <Route path="/notes" element={
                isMobile ? (
                  <MobilePageTransition>
                    <Notes notes={notes} loading={loading} />
                  </MobilePageTransition>
                ) : (
                  <PageTransition>
                    <Notes notes={notes} loading={loading} />
                  </PageTransition>
                )
              } />
              <Route path="/note/:id" element={
                isMobile ? (
                  <MobilePageTransition>
                    <NoteDetail />
                  </MobilePageTransition>
                ) : (
                  <PageTransition>
                    <NoteDetail />
                  </PageTransition>
                )
              } />
              <Route path="/archive" element={
                isMobile ? (
                  <MobilePageTransition>
                    <Archive posts={posts} loading={loading} onSelectPost={(p) => {
                      setNavigationMethod('slideRight');
                      navigate(`/post/${p.slug}`, { state: { from: '/archive' } });
                    }} />
                  </MobilePageTransition>
                ) : (
                  <PageTransition>
                    <Archive posts={posts} loading={loading} onSelectPost={(p) => {
                      setNavigationMethod('slideDown');
                      navigate(`/post/${p.slug}`, { state: { from: '/archive' } });
                    }} />
                  </PageTransition>
                )
              } />
              <Route path="/about" element={
                isMobile ? (
                  <MobilePageTransition>
                    <About />
                  </MobilePageTransition>
                ) : (
                  <PageTransition>
                    <About />
                  </PageTransition>
                )
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </ErrorBoundary>
      </motion.main>

      {/* AI助手 - 固定在屏幕右下角，像导航栏一样跟随用户 */}
      <Assistant />

      {/* Footer - 移动端优化 */}
      <footer className={`${isMobile ? 'py-12 px-4' : 'py-32 px-6'} border-t border-white/10`}>
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className={`${isMobile ? 'text-2xl mb-6' : 'text-5xl mb-16'} font-bold tracking-tighter opacity-20 select-none`}>
            AURA
          </div>
          
          {isMobile ? (
            // 移动端恢复翻转效果 - 缩小尺寸
            <div className="flex gap-6 text-xs uppercase tracking-wider font-bold text-white/60">
              {[
                { label: 'QQ', value: CONTACT_INFO.QQ },
                { label: 'WX', value: CONTACT_INFO.WX },
                { label: 'MAIL', value: CONTACT_INFO.MAIL }
              ].map((contact) => (
                <button
                  key={contact.label}
                  onClick={() => handleCopy(contact.value, contact.label)}
                  className="group relative overflow-hidden h-8 w-12 hover:text-white rounded-lg transition-colors duration-300"
                >
                  <div className="absolute inset-0 flex items-center justify-center group-hover:-translate-y-full transition-transform duration-500">
                    {contact.label}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 text-white font-bold bg-white/10 rounded-lg text-[10px]">
                    COPY
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // 桌面端完整版联系方式 - 缩小尺寸
            <div className="flex gap-12 text-sm uppercase tracking-wider font-bold text-white/60">
              {[
                { label: 'QQ', value: CONTACT_INFO.QQ },
                { label: 'WX', value: CONTACT_INFO.WX },
                { label: 'MAIL', value: CONTACT_INFO.MAIL }
              ].map((contact) => (
                <button
                  key={contact.label}
                  onClick={() => handleCopy(contact.value, contact.label)}
                  className="group relative overflow-hidden h-10 w-16 hover:text-white rounded-lg transition-colors duration-300"
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
