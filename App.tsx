import { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { SWRConfig } from 'swr';
import Intro from './components/Intro';
import Assistant from './components/Assistant';
import LoadingFallback from './components/LoadingFallback';
import ErrorBoundary from './components/ErrorBoundary';
import { CONTACT_INFO } from './constants';
import { Feed, PostDetail, Notes, NoteDetail, About, Archive } from './routes';
import { usePostsCache, useNotesCache } from './services/cacheService';
import { useIsMobile } from './hooks/useResponsive';
import { useShouldAnimate } from './hooks/useReducedMotion';

const AppInner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  
  const isMobile = useIsMobile();
  const shouldAnimate = useShouldAnimate();

  const { data: posts = [], isLoading: postsLoading, error: postsError } = usePostsCache();
  const { data: notes = [], isLoading: notesLoading, error: notesError } = useNotesCache();
  
  const loading = postsLoading || notesLoading;
  const error = postsError?.message || notesError?.message || null;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Reduced blur on mobile for better performance and readability
  const blurIntensity = isMobile ? 'blur(12px)' : 'blur(24px) saturate(180%)';

  return (
    <div className="min-h-screen selection:bg-white/20 selection:text-white">
      <Helmet>
        <title>Aura - 极简主义个人空间</title>
        <meta name="description" content="A digital sanctuary for minimalist aesthetics and intelligence." />
      </Helmet>

      {/* Toast */}
      {toast.show && (
        <motion.div 
          initial={shouldAnimate ? { opacity: 0, y: -20 } : false}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-8 right-8 z-50 px-6 py-4 rounded-2xl text-sm font-medium border shadow-2xl ${
            isMobile ? 'backdrop-blur-md' : 'backdrop-blur-xl'
          } ${
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

      {/* Navigation - simplified on mobile */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-4 md:pt-6 px-4">
        <motion.div 
          className={`relative rounded-full px-6 md:px-10 py-3 ${
            scrolled ? 'bg-black/10' : 'bg-white/[0.04]'
          }`}
          style={{ backdropFilter: blurIntensity }}
          whileHover={shouldAnimate ? { scale: scrolled ? 1.02 : 0.97 } : undefined}
        >
          <div className="relative flex items-center gap-6 md:gap-12">
            <motion.button 
              onClick={() => navigate('/')}
              className="text-base md:text-lg font-bold tracking-tight text-white/90 hover:text-white"
              whileHover={shouldAnimate ? { scale: 1.05 } : undefined}
              whileTap={shouldAnimate ? { scale: 0.95 } : undefined}
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
                  className={`px-3 md:px-4 py-2 rounded-full transition-colors ${
                    location.pathname === item.path 
                      ? 'text-white bg-white/12' 
                      : 'text-white/60 hover:text-white/90 hover:bg-white/[0.06]'
                  }`}
                  whileHover={shouldAnimate ? { scale: 1.05 } : undefined}
                  whileTap={shouldAnimate ? { scale: 0.95 } : undefined}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </nav>

      {/* Main Content */}
      <motion.main 
        key={location.pathname}
        className="pt-32 md:pt-44 pb-24 md:pb-48 px-4 md:px-6 max-w-7xl mx-auto"
        initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldAnimate ? 0.6 : 0, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Feed posts={posts} loading={loading} onSelectPost={(p) => navigate(`/post/${p.slug}`)} />} />
              <Route path="/post/:slug" element={<PostDetail posts={posts} loading={loading} />} />
              <Route path="/notes" element={<Notes notes={notes} loading={loading} />} />
              <Route path="/note/:id" element={<NoteDetail />} />
              <Route path="/archive" element={<Archive posts={posts} loading={loading} onSelectPost={(p) => navigate(`/post/${p.slug}`)} />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </motion.main>

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
