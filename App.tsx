import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { SWRConfig } from 'swr';
import Intro from './components/Intro';
import Assistant from './components/Assistant';
import ErrorBoundary from './components/ErrorBoundary';
import { CONTACT_INFO } from './constants';
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

  // 滚动追踪 - 用于导航栏渐变
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 页面切换时滚动到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  const showToast = (msg: string, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} 已复制到剪贴板`);
    } catch {
      showToast('复制失败', 'error');
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

  // 导航栏渐变计算
  const scrollProgress = Math.min(scrollY / 80, 1);
  const navOpacity = 0.02 + scrollProgress * 0.4;
  const navBlur = isMobile ? 12 + scrollProgress * 12 : 20 + scrollProgress * 20;
  const navBorder = scrollProgress * 0.15;
  const navShadow = scrollProgress * 0.3;

  return (
    <div className="min-h-screen selection:bg-white/20 selection:text-white">
      <Helmet>
        <title>Aura - 极简主义个人空间</title>
        <meta name="description" content="A digital sanctuary for minimalist aesthetics and intelligence." />
      </Helmet>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`fixed top-8 right-8 z-50 px-6 py-4 rounded-2xl text-sm font-medium border shadow-2xl backdrop-blur-xl ${
              toast.type === 'error' 
                ? 'bg-red-500/20 text-red-200 border-red-500/30' 
                : 'bg-white/20 text-white border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full animate-pulse ${toast.type === 'error' ? 'bg-red-400' : 'bg-green-400'}`} />
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation - 滚动渐变效果 */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-4 md:pt-6 px-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.div 
          className="relative rounded-full px-6 md:px-10 py-3"
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
          <div className="relative flex items-center gap-6 md:gap-12">
            <motion.button 
              onClick={() => navigate('/')}
              className="text-base md:text-lg font-bold tracking-tight text-white/90 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              AURA
            </motion.button>
            
            <div className="flex gap-2 md:gap-6 text-xs md:text-sm font-medium">
              {[
                { path: '/notes', label: 'Notes' },
                { path: '/archive', label: 'Archive' },
                { path: '/about', label: 'About' }
              ].map((item) => (
                <motion.button 
                  key={item.path}
                  onClick={() => handleNavigate(item.path)} 
                  className={`px-3 md:px-4 py-2 rounded-full transition-all duration-200 ${
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
      </motion.nav>

      {/* Main Content - 即时切换，无闪烁 */}
      <main className="pt-32 md:pt-44 pb-24 md:pb-48 px-4 md:px-6 max-w-7xl mx-auto">
        <ErrorBoundary>
          <Routes location={location}>
            <Route path="/" element={<Feed posts={posts} loading={loading} onSelectPost={(p) => navigate(`/post/${p.slug}`)} />} />
            <Route path="/post/:slug" element={<PostDetail posts={posts} loading={loading} />} />
            <Route path="/notes" element={<Notes notes={notes} loading={loading} />} />
            <Route path="/note/:id" element={<NoteDetail />} />
            <Route path="/archive" element={<Archive posts={posts} loading={loading} onSelectPost={(p) => navigate(`/post/${p.slug}`)} />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>

      <Assistant />

      {/* Footer */}
      <footer className="py-16 md:py-32 px-4 md:px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="text-3xl md:text-5xl font-bold tracking-tighter mb-8 md:mb-16 opacity-20 select-none">AURA</div>
          <div className="flex gap-6 md:gap-12 text-xs md:text-sm uppercase tracking-wider font-bold text-white/60">
            {[
              { label: 'QQ', value: CONTACT_INFO.QQ },
              { label: 'WX', value: CONTACT_INFO.WX },
              { label: 'MAIL', value: CONTACT_INFO.MAIL }
            ].map((contact) => (
              <button
                key={contact.label}
                onClick={() => handleCopy(contact.value, contact.label)}
                className="group relative overflow-hidden h-10 md:h-12 w-16 md:w-20 hover:text-white rounded-lg"
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
          <p className="mt-12 md:mt-24 text-xs text-white/20 tracking-wider uppercase">Designed for clarity © 2024</p>
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
