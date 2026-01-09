import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Intro from './components/Intro';
import Assistant from './components/Assistant';
import { CONTACT_INFO } from './constants';
import { postsApi, notesApi } from './services/supabaseService';

// Pages
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import Notes from './pages/Notes';
import About from './pages/About';
import Admin from './components/Admin';

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
        const [postsData, notesData] = await Promise.all([
          postsApi.getAll(),
          notesApi.getAll()
        ]);
        
        const formattedPosts = postsData.map((post: any) => ({
          ...post,
          image: post.cover_image,
          date: new Date(post.created_at).toLocaleDateString('zh-CN'),
          readingTime: `${post.reading_time} 分钟`,
          content: post.html_content || post.content
        }));
        
        const formattedNotes = notesData.map((note: any) => ({
          ...note,
          date: new Date(note.created_at).toLocaleDateString('zh-CN')
        }));

        setPosts(formattedPosts);
        setNotes(formattedNotes);
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

  // Simple keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        navigate('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

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

  if (showIntro && location.pathname === '/') {
    return <Intro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen selection:bg-white/20 selection:text-white">
      <Helmet>
        <title>Aura | Minimalist Personal Space</title>
        <meta name="description" content="A digital sanctuary for minimalist aesthetics and intelligence." />
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

      {/* 透明灵动岛导航 */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-8">
        <div className={`relative transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          scrolled 
            ? 'bg-black/20 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)] scale-100' 
            : 'bg-transparent px-8 py-4 scale-95'
        }`}>
          {/* 背景光晕效果 */}
          <div className={`absolute inset-0 rounded-full transition-opacity duration-700 ${
            scrolled ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/5 via-white/10 to-white/5 blur-xl" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/5 to-transparent" />
          </div>
          
          <div className="relative flex items-center gap-12">
            <button 
              onClick={() => navigate('/')}
              className="text-xl font-bold tracking-tighter text-white hover:opacity-70 transition-all duration-300 hover:scale-105 relative group"
            >
              AURA
              {/* 品牌光晕 */}
              <div className="absolute -inset-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
            </button>
            
            <div className="flex gap-8 text-sm font-medium">
              {[
                { path: '/', label: 'Feed' },
                { path: '/notes', label: 'Notes' },
                { path: '/about', label: 'About' }
              ].map((item) => (
                <button 
                  key={item.path}
                  onClick={() => navigate(item.path)} 
                  className={`relative transition-all duration-300 hover:scale-105 group ${
                    location.pathname === item.path 
                      ? 'text-white' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {item.label}
                  {/* 活跃状态指示器 */}
                  {location.pathname === item.path && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
                  )}
                  {/* 悬停效果 */}
                  <div className="absolute -inset-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="pt-44 pb-48 px-6 max-w-7xl mx-auto">
        <div className="view-transition">
          <Routes>
            <Route path="/" element={<Feed posts={posts} loading={loading} onSelectPost={(p) => navigate(`/post/${p.slug}`)} />} />
            <Route path="/post/:slug" element={<PostDetail posts={posts} loading={loading} />} />
            <Route path="/notes" element={<Notes notes={notes} loading={loading} />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {/* AI Assistant */}
      <Assistant />

      {/* Simple Footer */}
      <footer className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="text-4xl font-bold tracking-tighter mb-12 opacity-10">AURA</div>
          <div className="flex gap-8 text-xs uppercase tracking-wider font-bold text-white/40">
            {[
              { label: 'QQ', value: CONTACT_INFO.QQ },
              { label: 'WX', value: CONTACT_INFO.WX },
              { label: 'MAIL', value: CONTACT_INFO.MAIL }
            ].map((contact) => (
              <button
                key={contact.label}
                onClick={() => handleCopy(contact.value, contact.label)}
                className="hover:text-white transition-colors"
              >
                {contact.label}
              </button>
            ))}
          </div>
          <p className="mt-20 text-xs text-white/5 tracking-wider uppercase">
            Designed for clarity &copy; 2024
          </p>
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