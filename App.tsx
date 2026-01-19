import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { SWRConfig } from 'swr';
import Intro from './components/Intro';
import Assistant from './components/Assistant';
import ErrorBoundary from './components/ErrorBoundary';
import DesktopNavigation from './components/DesktopNavigation';
import PageTransitionMask from './components/PageTransitionMask';
import { MagneticButton } from './components/HoverEffects';
import ScrollToTop from './components/ScrollToTop';
import GlobalRipple from './components/GlobalRipple';
import { CONTACT_INFO } from './constants';
import { Z_INDEX } from './constants/zIndex';
import { MOBILE_NAV_CONFIG } from './constants/mobileNavigation';
import { haptics } from './utils/haptics';
import { usePostsCache, useNotesCache } from './services/cacheService';
import { useIsMobile } from './hooks/useResponsive';
import { usePageTransition } from './hooks/usePageTransition';
import { useMobileOptimization } from './hooks/useMobileOptimization';
import { useToast } from './hooks/useToast';

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
  const isMobile = useIsMobile();
  const [showIntro, setShowIntro] = useState(!isMobile);
  const [scrollY, setScrollY] = useState(0);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' as 'success' | 'info' | 'error' });
  const [hoveredNavItem, setHoveredNavItem] = useState<string | null>(null);

  // 使用页面切换动画 hook
  const { setNavigationMethod } = usePageTransition();

  // 移动端优化
  useMobileOptimization();

  // 全局 Toast 事件监听（供 useToast 调用）
  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ message: string; type?: 'success' | 'info' | 'error' }>).detail;
      if (!detail) return;
      showToast(detail.message, detail.type);
    };

    window.addEventListener('xuan:toast', handleToastEvent as EventListener);
    return () => window.removeEventListener('xuan:toast', handleToastEvent as EventListener);
  }, []);

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

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), isMobile ? 3000 : 2500);
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      // 移动端优化：检查是否支持Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        showToast(`${label} 已复制到剪贴板`);
        // 移动端震动反馈
        if (isMobile) {
          haptics.success();
        }
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
        // 移动端震动反馈
        if (isMobile) {
          haptics.success();
        }
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

    // 设置导航方式 - 统一使用桌面端逻辑
    const currentPath = location.pathname;
    const isToDetail = path.includes('/post/') || path.includes('/note/');
    const isFromDetail = currentPath.includes('/post/') || currentPath.includes('/note/');
    const isToAbout = path === '/about';
    const isFromAbout = currentPath === '/about';

    // 统一使用桌面端导航动画
    if (isToDetail && !isFromDetail) {
      setNavigationMethod('slideDown');
    } else if (!isToDetail && isFromDetail) {
      setNavigationMethod('slideUp');
    } else if (isToAbout || isFromAbout) {
      setNavigationMethod('zoomIn');
    } else {
      setNavigationMethod('fade');
    }

    navigate(path);
  };

  if (showIntro && location.pathname === '/' && !isMobile) {
    return <Intro onComplete={() => setShowIntro(false)} />;
  }
  // 导航栏渐变计算 - 移动端优化
  const scrollProgress = Math.min(scrollY / (isMobile ? 60 : 80), 1);
  const navOpacity = 0.02 + scrollProgress * (isMobile ? 0.3 : 0.4);
  const navBlur = isMobile ? 8 + scrollProgress * 8 : 20 + scrollProgress * 20;
  const navBorder = scrollProgress * (isMobile ? 0.1 : 0.15);
  const navShadow = scrollProgress * (isMobile ? 0.2 : 0.3);

  return (
    <div className="min-h-screen selection:bg-white/20 selection:text-white"
         style={{ isolation: 'auto' }}>
      <Helmet>
        <title>Xuan</title>
        <meta name="description" content="welcome" />
      </Helmet>

      {/* 全局涟漪效果 */}
      <GlobalRipple />

      {/* 页面切换遮罩 - 确保切换时不显示其他内容 */}
      <PageTransitionMask />

      {/* Toast - 苹果风格通知，移动端优化为弹窗 */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: isMobile ? 50 : -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isMobile ? 50 : -30, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              duration: 0.35
            }}
            className={`fixed ${
              isMobile 
                ? 'inset-x-4 bottom-20 top-auto pointer-events-auto' // 移动端可点击
                : 'inset-x-4 top-4 md:inset-x-auto md:top-8 md:right-8 pointer-events-none' // 桌面端不可点击
            }`}
            style={{ zIndex: Z_INDEX.TOAST }}
            onClick={isMobile ? () => setToast(prev => ({ ...prev, show: false })) : undefined}
          >
            <div className={`w-full ${isMobile ? 'max-w-none' : 'md:max-w-sm'} ${
              isMobile 
                ? 'px-6 py-4 rounded-2xl cursor-pointer' // 移动端添加点击样式
                : 'px-4 py-3 rounded-xl'
            } text-sm font-medium border shadow-2xl backdrop-blur-xl transition-transform duration-200 ${
              isMobile ? 'active:scale-95' : ''
            } ${
              toast.type === 'error'
                ? 'bg-red-500/90 text-white border-red-400/50'
                : toast.type === 'info'
                  ? 'bg-blue-500/90 text-white border-blue-400/50'
                  : 'bg-green-500/90 text-white border-green-400/50'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`${isMobile ? 'w-3 h-3 mt-0.5' : 'w-2 h-2 mt-1'} rounded-full flex-shrink-0 ${
                  toast.type === 'error' ? 'bg-red-300' :
                  toast.type === 'info' ? 'bg-blue-300' : 'bg-green-300'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`break-words ${isMobile ? 'text-base' : 'text-sm'}`}>
                    {toast.msg}
                  </p>
                  {/* 移动端添加关闭提示 */}
                  {isMobile && (
                    <p className="text-xs opacity-70 mt-1">
                      轻触关闭
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation - 响应式导航栏，移动端灵动岛风格 */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 flex justify-center ${isMobile ? 'pt-2 px-4' : 'px-6 pt-6'}`}
        style={{
          zIndex: Z_INDEX.NAVIGATION,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          pointerEvents: 'none',
          position: 'fixed',
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
        {/* 统一的响应式导航栏 */}
        <motion.div
          className={`relative magnetic-hover ${isMobile ? 'rounded-full' : 'rounded-full px-10 py-3 w-auto'}`}
          style={{
            pointerEvents: 'auto',
            backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.85)' : `rgba(0, 0, 0, ${navOpacity})`,
            backdropFilter: isMobile ? `blur(${MOBILE_NAV_CONFIG.VISUAL.BACKDROP_BLUR}px) saturate(180%)` : `blur(${navBlur}px) saturate(${150 + scrollProgress * 30}%)`,
            boxShadow: isMobile ? `0 4px 20px rgba(0,0,0,${MOBILE_NAV_CONFIG.VISUAL.SHADOW_OPACITY}), 0 0 0 ${MOBILE_NAV_CONFIG.VISUAL.BORDER_WIDTH}px rgba(255,255,255,${MOBILE_NAV_CONFIG.VISUAL.BORDER_OPACITY})` : (scrollProgress > 0.2 ? `0 8px 32px rgba(0, 0, 0, ${navShadow})` : 'none'),
            borderWidth: isMobile ? `${MOBILE_NAV_CONFIG.VISUAL.BORDER_WIDTH}px` : '1px',
            borderStyle: 'solid',
            borderColor: isMobile ? `rgba(255, 255, 255, ${MOBILE_NAV_CONFIG.VISUAL.BORDER_OPACITY})` : `rgba(255, 255, 255, ${navBorder})`,
            transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            minWidth: isMobile ? `${MOBILE_NAV_CONFIG.CONTAINER.MIN_WIDTH}px` : 'auto',
            paddingLeft: isMobile ? `${MOBILE_NAV_CONFIG.CONTAINER.PADDING_X}px` : undefined,
            paddingRight: isMobile ? `${MOBILE_NAV_CONFIG.CONTAINER.PADDING_X}px` : undefined,
            paddingTop: isMobile ? `${MOBILE_NAV_CONFIG.CONTAINER.PADDING_Y}px` : undefined,
            paddingBottom: isMobile ? `${MOBILE_NAV_CONFIG.CONTAINER.PADDING_Y}px` : undefined,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div className={`relative flex items-center justify-between ${isMobile ? 'gap-4' : 'gap-12'}`}>
            <MagneticButton
              onClick={() => handleNavigate('/')}
              className={`font-bold tracking-tight text-white/90 hover:text-white transition-all duration-300 relative overflow-hidden group min-w-[44px] min-h-[44px] flex items-center justify-center ${isMobile ? 'text-base' : 'text-lg'}`}
              strength={0.3}
            >
              {/* 苹果风格的悬停背景光效 */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-sm" />
              <span className="relative z-10 group-hover:tracking-wider transition-all duration-300">XUAN</span>
            </MagneticButton>

            <div className={`flex items-center ${isMobile ? 'gap-1.5' : 'gap-6'} text-xs md:text-sm font-medium relative`}>
              {/* 平滑高亮背景 - 桌面端 */}
              {!isMobile && (
                <motion.div
                  className="absolute bg-white/12 rounded-full pointer-events-none"
                  style={{
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 2px 12px rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                  animate={{
                    opacity: hoveredNavItem || ['/notes', '/archive', '/about'].includes(location.pathname) ? 1 : 0,
                    scale: hoveredNavItem ? 1.02 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                    mass: 0.8
                  }}
                  layoutId="nav-highlight"
                />
              )}
              
              {[
                { path: '/notes', label: isMobile ? 'Notes' : 'Notes', icon: '📝' },
                { path: '/archive', label: isMobile ? 'Archive' : 'Archive', icon: '📂' },
                { path: '/about', label: isMobile ? 'About' : 'About', icon: '👋' }
              ].map((item) => (
                <motion.button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  aria-label={`跳转到 ${item.label} 页面`}
                  className={`rounded-full flex items-center justify-center relative z-10 transition-colors duration-200
                    ${isMobile
                      ? 'min-w-[44px] min-h-[44px] px-3 py-2 text-sm'
                      : 'min-w-[44px] min-h-[44px] px-4 py-2'
                    } 
                    ${location.pathname === item.path
                      ? 'text-white'
                      : hoveredNavItem === item.path
                        ? 'text-white'
                        : 'text-white/60'
                    }`}
                  onMouseEnter={() => !isMobile && setHoveredNavItem(item.path)}
                  onMouseLeave={() => !isMobile && setHoveredNavItem(null)}
                  whileHover={!isMobile ? {
                    scale: 1.02,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      duration: 0.2
                    }
                  } : {}}
                  whileTap={{
                    scale: 0.98,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      duration: 0.1
                    }
                  }}
                >
                  <motion.span
                    animate={{
                      scale: hoveredNavItem === item.path || location.pathname === item.path ? 1.02 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      duration: 0.2
                    }}
                  >
                    {item.label}
                  </motion.span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.nav>

      {/* Mobile Bottom Bar - 移除 */}

      {/* Main Content - 智能页面切换动画系统 */}
      <motion.main
        className="pb-24 md:pb-48 px-4 md:px-6 pt-20 md:pt-24 max-w-7xl mx-auto relative"
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          // 移除可能影响固定定位的transform
          // transform: 'translateZ(0)',
          // 确保主容器有最小高度，避免页面切换时的空白
          minHeight: 'calc(100vh - 4rem)',
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
                <DesktopNavigation>
                  <Feed posts={posts} loading={loading} onSelectPost={(p) => {
                    setNavigationMethod('slideDown');
                    navigate(`/post/${p.slug}`, { state: { from: '/' } });
                  }} />
                </DesktopNavigation>
              } />
              <Route path="/post/:slug" element={
                <DesktopNavigation>
                  <PostDetail posts={posts} loading={loading} />
                </DesktopNavigation>
              } />
              <Route path="/notes" element={
                <DesktopNavigation>
                  <Notes notes={notes} loading={loading} />
                </DesktopNavigation>
              } />
              <Route path="/note/:id" element={
                <DesktopNavigation>
                  <NoteDetail />
                </DesktopNavigation>
              } />
              <Route path="/archive" element={
                <DesktopNavigation>
                  <Archive posts={posts} loading={loading} onSelectPost={(p) => {
                    setNavigationMethod('slideDown');
                    navigate(`/post/${p.slug}`, { state: { from: '/archive' } });
                  }} />
                </DesktopNavigation>
              } />
              <Route path="/about" element={
                <DesktopNavigation>
                  <About />
                </DesktopNavigation>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </ErrorBoundary>
      </motion.main>

      {/* AI助手 - 仅在桌面端显示 */}
      {!isMobile && <Assistant />}

      {/* 滚动到顶部按钮 - 只在详情页面显示 */}
      {(location.pathname.includes('/note/') || location.pathname.includes('/post/')) && (
        <ScrollToTop threshold={isMobile ? 200 : 300} />
      )}

      {/* Footer - 响应式优化 */}
      <footer className="py-12 md:py-32 px-4 md:px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="text-2xl md:text-5xl mb-6 md:mb-16 font-bold tracking-tighter opacity-20 select-none">
            XUAN
          </div>

          {/* 统一的联系方式 - 响应式 */}
          <div className="flex gap-6 md:gap-12 text-xs md:text-sm uppercase tracking-wider font-bold text-white/60">
            {[
              { label: 'QQ', value: CONTACT_INFO.QQ },
              { label: 'WX', value: CONTACT_INFO.WX },
              { label: 'MAIL', value: CONTACT_INFO.MAIL }
            ].map((contact) => (
              <button
                key={contact.label}
                onClick={() => handleCopy(contact.value, contact.label)}
                className="group relative overflow-hidden h-8 w-12 md:h-10 md:w-16 hover:text-white rounded-lg transition-colors duration-300"
              >
                <div className="absolute inset-0 flex items-center justify-center group-hover:-translate-y-full transition-transform duration-500">
                  {contact.label}
                </div>
                <div className="absolute inset-0 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 text-white font-bold bg-white/10 rounded-lg text-[10px] md:text-xs">
                  COPY
                </div>
              </button>
            ))}
          </div>

          <p className="mt-8 md:mt-24 text-[10px] md:text-xs text-white/20 tracking-wider uppercase">
            Thank you for your coming
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
export { AppInner }; // 导出 AppInner 用于测试

