import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Intro from './components/Intro';
import Assistant from './components/Assistant';
import { ICONS, CONTACT_INFO } from './constants';
import { postsApi, notesApi } from './services/supabaseService';
import { Post } from './types';

// Pages
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import Notes from './pages/Notes';
import About from './pages/About';

// Lazy load components
const Admin = React.lazy(() => import('./components/Admin'));

const AppInner: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Toast State
  const [toast, setToast] = useState<{ show: boolean, msg: string }>({ show: false, msg: '' });
  const toastTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsData, notesData] = await Promise.all([
          postsApi.getAll(),
          notesApi.getAll()
        ]);

        const formattedPosts = postsData.map((post: any) => ({
          ...post,
          image: post.cover_image,
          date: new Date(post.created_at).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          readingTime: `${post.reading_time} 分钟`,
          content: post.html_content || post.content
        }));

        const formattedNotes = notesData.map((note: any) => ({
          ...note,
          date: new Date(note.created_at).toLocaleDateString('zh-CN')
        }));

        setPosts(formattedPosts);
        setNotes(formattedNotes);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const glimmer = document.createElement('div');
      glimmer.className = 'click-glimmer';
      glimmer.style.left = `${e.clientX}px`;
      glimmer.style.top = `${e.clientY}px`;
      document.body.appendChild(glimmer);
      setTimeout(() => glimmer.remove(), 600);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        navigate('/admin');
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, msg: `${label} 已复制到剪贴板` });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, msg: '' });
    }, 2500);
  };

  const Archive = () => (
    <div className="py-12">
      <Helmet>
        <title>Archive | Aura</title>
      </Helmet>
      <h2 className="text-6xl font-bold tracking-tighter mb-16">归档文章</h2>
      {loading ? (
        <div className="text-center text-white/40 py-12">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post, i) => (
            <div key={post.id} className="glass p-8 rounded-[2.5rem] flex items-center justify-between group cursor-pointer hover:bg-white/[0.08] transition-all border border-white/5 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 50}ms` }} onClick={() => navigate(`/post/${post.slug}`)}>
              <div className="space-y-1 flex-1">
                <p className="text-white/30 text-[10px] uppercase tracking-widest">{post.date}</p>
                <h3 className="text-2xl font-semibold group-hover:translate-x-2 transition-transform duration-500">{post.title}</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-white/5 group-hover:bg-white group-hover:text-black transition-all">{ICONS.CHEVRON_RIGHT}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const navLinks = [
    { label: 'NOTES', path: '/notes' },
    { label: 'ARCHIVE', path: '/archive' },
    { label: 'ABOUT', path: '/about' }
  ];

  if (showIntro && location.pathname === '/') {
    return <Intro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen selection:bg-white/20 selection:text-white">
      <Helmet>
        <title>Aura | Minimalist Personal Space</title>
        <meta name="description" content="A digital sanctuary for minimalist aesthetics and intelligence." />
      </Helmet>

      {/* Toast Notification */}
      <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 rounded-full bg-[#1a1a1a]/60 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'}`}>
        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
        <span className="text-xs font-medium tracking-wide text-white/90">{toast.msg}</span>
      </div>

      <nav className={`fixed top-8 inset-x-0 z-[60] px-4 md:px-6 flex justify-center transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? 'translate-y-[-10px] scale-[0.96]' : 'translate-y-0'}`}>
        <div className={`flex items-center gap-0.5 md:gap-1.5 p-1.5 md:p-2 rounded-full glass transition-all duration-1000 ${scrolled ? 'shadow-[0_40px_100px_rgba(0,0,0,0.7)] bg-black/50 border-white/15 backdrop-blur-[40px]' : ''}`}>
          <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); }} className="group px-3 md:px-6 py-2.5 text-xs md:text-sm font-bold tracking-tight hover:bg-white/10 rounded-full transition-all duration-500 flex items-center gap-2 md:gap-3 active:scale-95">
            <div className="relative w-2 h-2 md:w-2.5 md:h-2.5 flex-shrink-0"><div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20 scale-150" /><div className="relative w-full h-full bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)]" /></div>
            <span className="group-hover:translate-x-0.5 transition-transform hidden xs:inline">Aura</span>
          </button>
          <div className="h-4 md:h-5 w-[1px] bg-white/10 mx-1 md:mx-2" />
          {navLinks.map(item => (
            <button key={item.label} onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate(item.path); }} className={`px-3 md:px-5 py-2.5 text-[9px] md:text-[11px] uppercase tracking-[0.2em] font-black rounded-full transition-all duration-500 active:scale-95 whitespace-nowrap ${location.pathname === item.path ? 'bg-white text-black shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>{item.label}</button>
          ))}
        </div>
      </nav>

      <main className="relative z-10 pt-44 md:pt-56 pb-48 px-6 md:px-8 max-w-7xl mx-auto">
        <div className="view-transition">
          <React.Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-white/10 tracking-[0.5em] uppercase text-xs animate-pulse">Establishing Connection...</div>}>
            <Routes>
              <Route path="/" element={<Feed posts={posts} loading={loading} onSelectPost={(p) => navigate(`/post/${p.slug}`)} />} />
              <Route path="/post/:slug" element={<PostDetail posts={posts} loading={loading} />} />
              <Route path="/notes" element={<Notes notes={notes} loading={loading} />} />
              <Route path="/archive" element={<Archive />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </div>
      </main>

      <Assistant />

      <footer className="relative z-10 py-24 md:py-40 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.01]">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="text-4xl font-bold tracking-tighter mb-12 opacity-10 select-none grayscale contrast-200">AURA</div>
          <div className="flex flex-row justify-center items-center gap-8 md:gap-20 text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">
            {[{ id: 'qq', label: 'QQ', value: CONTACT_INFO.QQ }, { id: 'wx', label: 'WX', value: CONTACT_INFO.WX }, { id: 'mail', label: 'MAIL', value: CONTACT_INFO.MAIL }].map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleCopy(contact.value, contact.label)}
                className="group relative overflow-hidden h-8 w-[5em] md:w-[6em] focus:outline-none hover:text-white transition-colors duration-500"
              >
                <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-y-full group-active:scale-90">
                  {contact.label}
                </div>
                <div className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0 group-active:scale-90 text-white font-bold bg-white/5 rounded-lg">
                  COPY
                </div>
              </button>
            ))}
          </div>
          <div className="mt-20 md:mt-32 space-y-4"><p className="text-[9px] text-white/5 tracking-[0.6em] uppercase font-medium">Designed for clarity &copy; 2024</p><div className="w-8 h-[1px] bg-white/5 mx-auto" /></div>
        </div>
      </footer>

      <style>{`
        .view-transition { animation: auraEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; will-change: transform, opacity, filter; }
        @keyframes auraEntrance { 0% { opacity: 0; transform: translateY(15px) scale(0.995); filter: blur(10px); } 100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
        .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(16px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.08); }
        .prose blockquote { border-left-width: 2px; border-color: rgba(255,255,255,0.2); padding-left: 2rem; margin: 3rem 0; font-style: italic; color: rgba(255,255,255,0.8); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
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
