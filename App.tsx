import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import Intro from './components/Intro';
import Assistant from './components/Assistant';
import { CONTACT_INFO } from './constants';
import { postsApi, notesApi } from './services/supabaseService';

// Pages
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import Notes from './pages/Notes';
import NoteDetail from './pages/NoteDetail';
import About from './pages/About';
import Archive from './pages/Archive';

const AppInner: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 使用文件系统读取posts和notes，保持一致
        const { getAllPosts } = await import('./utils/posts');
        const { getAllNotes } = await import('./utils/notes');
        
        const postsData = getAllPosts();
        const notesData = getAllNotes();
        
        const formattedPosts = postsData.map((post: any) => ({
          ...post,
          image: post.cover_image,
          date: new Date(post.created_at).toLocaleDateString('zh-CN'),
          readingTime: `${post.reading_time} 分钟`,
          content: post.html_content || post.content
        }));
        
        setPosts(formattedPosts);
        setNotes(notesData);
      } catch (err: any) {
        setError(err.message || '数据加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Simple scroll handler
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 简化的页面切换处理
  useEffect(() => {
    // 立即滚动到顶部
    window.scrollTo({ 
      top: 0, 
      behavior: 'auto'
    });
  }, [location.pathname]);

  // Simple toast function
  const showToast = (msg: string, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
  };

  // Copy handler
  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} 已复制到剪贴板`);
    } catch (err) {
      showToast('复制失败', 'error');
    }
  };

  // 简化的导航处理
  const handleNavigate = (path: string) => {
    // 如果是当前页面，直接滚动到顶部
    if (location.pathname === path) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }

    // 直接导航，让页面切换效果处理渐入
    navigate(path);
  };

  if (showIntro && location.pathname === '/') {
    return <Intro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen selection:bg-white/20 selection:text-white" style={{
      scrollBehavior: 'smooth'
    }}>
      <Helmet>
        <title>Aura - 极简主义个人空间</title>
        <meta name="description" content="A digital sanctuary for minimalist aesthetics and intelligence." />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css" />
        <style>{`
          html {
            scroll-behavior: smooth;
          }
          
          /* Google 风格滚动条 */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
          
          /* Google Material Design 阴影 */
          .material-shadow-1 {
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
          }
          
          .material-shadow-2 {
            box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
          }
          
          .material-shadow-3 {
            box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
          }
        `}</style>
      </Helmet>

      {/* 增强版 Toast 通知 */}
      {toast.show && (
        <div className={`fixed top-8 right-8 z-50 px-6 py-4 rounded-2xl text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] transform backdrop-blur-xl border shadow-2xl animate-in slide-in-from-top-4 fade-in ${
          toast.type === 'error' 
            ? 'bg-red-500/20 text-red-200 border-red-500/30 shadow-red-500/20' 
            : 'bg-white/20 text-white border-white/20 shadow-white/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              toast.type === 'error' ? 'bg-red-400' : 'bg-green-400'
            }`} />
            {toast.msg}
          </div>
        </div>
      )}

      {/* Google Material Design 风格透明导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-6">
        <motion.div 
          className={`relative transition-all duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)] ${
            scrolled 
              ? 'bg-black/10 backdrop-blur-xl rounded-full px-10 py-3 material-shadow-2 scale-100' 
              : 'bg-white/[0.04] backdrop-blur-lg rounded-full px-10 py-3 material-shadow-1 scale-95'
          }`}
          style={{ 
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)'
          }}
          whileHover={{ scale: scrolled ? 1.02 : 0.97 }}
          transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
        >
          {/* Google Material Design 风格内部光效 */}
          <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
            scrolled ? 'opacity-100' : 'opacity-70'
          }`}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03]" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.04] via-transparent to-white/[0.01]" />
          </div>
          
          <div className="relative flex items-center gap-12">
            <motion.button 
              onClick={() => navigate('/')}
              className="text-lg font-bold tracking-tight text-white/90 hover:text-white transition-all duration-200 relative group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              AURA
              {/* Google 风格品牌光晕 */}
              <motion.div 
                className="absolute -inset-3 rounded-xl bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-all duration-200 blur-sm" 
                layoutId="brand-glow"
              />
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
                  className={`relative px-4 py-2 rounded-full transition-all duration-200 group ${
                    location.pathname === item.path 
                      ? 'text-white bg-white/12 material-shadow-1' 
                      : 'text-white/60 hover:text-white/90 hover:bg-white/[0.06]'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    backdropFilter: location.pathname === item.path ? 'blur(16px) saturate(180%)' : 'none'
                  }}
                >
                  {item.label}
                  {/* Google Material Design 活跃指示器 */}
                  {location.pathname === item.path && (
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.06] to-white/[0.02]" 
                      layoutId="active-nav"
                      transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                    />
                  )}
                  {/* Google 风格悬停效果 */}
                  <motion.div 
                    className="absolute -inset-1 rounded-full bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-all duration-200" 
                    whileHover={{ scale: 1.1 }}
                  />
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </nav>

      {/* 主内容区 - 直接缓慢渐入，无退出动画 */}
      <motion.main 
        key={location.pathname}
        className="pt-44 pb-48 px-6 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.25, 0.46, 0.45, 0.94],
          opacity: { duration: 0.6 },
          y: { duration: 0.8 }
        }}
      >
        <Routes>
          <Route path="/" element={<Feed posts={posts} loading={loading} onSelectPost={(p) => navigate(`/post/${p.slug}`, { state: { from: '/' } })} />} />
          <Route path="/post/:slug" element={<PostDetail posts={posts} loading={loading} />} />
          <Route path="/notes" element={<Notes notes={notes} loading={loading} />} />
          <Route path="/note/:id" element={<NoteDetail />} />
          <Route path="/archive" element={<Archive posts={posts} loading={loading} onSelectPost={(p) => navigate(`/post/${p.slug}`, { state: { from: '/archive' } })} />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.main>

      {/* AI Assistant */}
      <Assistant />

      {/* 增强版底部 */}
      <footer className="py-32 px-6 border-t border-white/10 bg-gradient-to-b from-transparent via-white/[0.01] to-white/[0.02]">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="text-5xl font-bold tracking-tighter mb-16 opacity-20 select-none">AURA</div>
          <div className="flex gap-12 text-sm uppercase tracking-wider font-bold text-white/60">
            {[
              { label: 'QQ', value: CONTACT_INFO.QQ },
              { label: 'WX', value: CONTACT_INFO.WX },
              { label: 'MAIL', value: CONTACT_INFO.MAIL }
            ].map((contact) => (
              <button
                key={contact.label}
                onClick={() => handleCopy(contact.value, contact.label)}
                className="group relative overflow-hidden h-12 w-20 focus:outline-none hover:text-white transition-all duration-500 focus-ring rounded-lg"
                aria-label={`复制${contact.label}`}
              >
                {/* 默认显示的标签 */}
                <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-y-full group-active:scale-90">
                  {contact.label}
                </div>
                {/* 悬停时显示的 COPY */}
                <div className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0 group-active:scale-90 text-white font-bold bg-white/10 rounded-lg backdrop-blur-sm">
                  COPY
                </div>
              </button>
            ))}
          </div>
          <div className="mt-24 space-y-6">
            <p className="text-xs text-white/20 tracking-wider uppercase font-medium">
              Designed for clarity &copy; 2024
            </p>
            <div className="w-12 h-[1px] bg-white/10 mx-auto" />
          </div>
        </div>
      </footer>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 left-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">
          {error}
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