
import React, { useState, useEffect, useRef } from 'react';
import Intro from './components/Intro';
import Assistant from './components/Assistant';
import BlogCard from './components/BlogCard';
import CommentSection from './components/CommentSection';
import LikeButton from './components/LikeButton';
import HomepageComments from './components/HomepageComments';
import Admin from './components/Admin';
import InteractiveParticles from './components/InteractiveParticles';
import { QUOTES_DATA, ICONS, CONTACT_INFO } from './constants';
import { postsApi, engagementApi, notesApi } from './services/supabaseService';
import { ViewState, Post } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.INTRO);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Toast State for "Apple-style" popup
  const [toast, setToast] = useState<{ show: boolean, msg: string }>({ show: false, msg: '' });
  const toastTimeoutRef = useRef<any>(null);

  // 加载文章
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 并行加载文章和随感
        const [postsData, notesData] = await Promise.all([
          postsApi.getAll(),
          notesApi.getAll()
        ]);

        // 转换文章数据
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

        // 转换笔记数据
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

  // 访问统计
  useEffect(() => {
    if (selectedPost) {
      const trackView = async () => {
        try {
          await engagementApi.incrementView(selectedPost.id);
        } catch (err) {
          console.error('Failed to track view:', err);
        }
      };
      trackView();
    }
  }, [selectedPost]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);

    // 全局鼠标事件处理：点击光晕 + 聚光灯追踪
    const handleGlobalMouseMove = (e: MouseEvent) => {
      // 更新 CSS 变量，实现背景聚光灯跟随
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

    // 管理后台快捷键：Ctrl + ,
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault(); // 防止触发浏览器默认行为（如某些浏览器的设置）
        navigateTo(ViewState.ADMIN);
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
  }, []);

  const navigateTo = (newView: ViewState) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedPost(null);
    setView(newView);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);

    // Show Toast
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, msg: `${label} 已复制到剪贴板` });

    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, msg: '' });
    }, 2500);
  };

  if (view === ViewState.INTRO) {
    return <Intro onComplete={() => setView(ViewState.FEED)} />;
  }

  const renderContent = () => {
    if (selectedPost) {
      return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <button onClick={() => setSelectedPost(null)} className="group flex items-center gap-2 text-white/40 hover:text-white transition-all mb-12 px-5 py-2 rounded-full glass active:scale-95">
            <div className="rotate-180 group-hover:-translate-x-1 transition-transform">{ICONS.CHEVRON_RIGHT}</div>
            <span className="text-sm font-medium">返回列表</span>
          </button>
          <header className="mb-20">
            <div className="flex items-center gap-3 text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
              <span>{selectedPost.date}</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span>{selectedPost.category}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-10 leading-tight">{selectedPost.title}</h1>
            <div className="flex items-center justify-between">
              <div className="h-[2px] w-20 bg-white/20 mb-10" />
              <div className="flex items-center gap-6 mb-10">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-1">VIEWS</span>
                  <span className="text-lg font-light text-white/40 tabular-nums">{selectedPost.views || 0}</span>
                </div>
                <LikeButton targetType="post" targetId={selectedPost.id} initialCount={selectedPost.likes_count} />
              </div>
            </div>
            <p className="text-xl md:text-2xl text-white/50 leading-relaxed font-light">{selectedPost.excerpt}</p>
          </header>
          <div className="rounded-[3rem] overflow-hidden mb-24 aspect-[16/9] glass shadow-2xl"><img src={selectedPost.image} className="w-full h-full object-cover" /></div>
          <article className="prose prose-invert max-w-none prose-p:text-white/60 prose-p:leading-[1.9] prose-p:text-xl prose-p:font-light prose-headings:font-bold prose-headings:tracking-tighter prose-blockquote:border-white/20 prose-blockquote:text-white/80" dangerouslySetInnerHTML={{ __html: selectedPost.content }} />

          {/* 评论区 */}
          <CommentSection postId={selectedPost.id} />
        </div>
      );
    }

    switch (view) {
      case ViewState.NOTEBOOK:
        return (
          <div className="py-12">
            <header className="mb-24">
              <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 italic">NOTES.</h2>
              <p className="text-xl text-white/30 font-light max-w-lg">那些转瞬即逝的思想，在留白间沉淀。</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {notes.length === 0 ? (
                <div className="col-span-full py-20 text-center text-white/20 font-light border border-dashed border-white/5 rounded-[3rem]">
                  暂无笔记。在 Obsidian 的 content/notes 中写点什么吧。
                </div>
              ) : (
                notes.map((quote, i) => (
                  <div key={quote.id || i} className="glass p-10 rounded-[2.5rem] relative group border border-white/5 hover:border-white/20 transition-all duration-700 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="absolute top-8 left-8">{ICONS.QUOTES}</div>
                    <p className="text-xl md:text-2xl font-light leading-relaxed text-white/80 mb-10 pt-10">“{quote.text}”</p>
                    <div className="flex items-center justify-between border-t border-white/5 pt-8">
                      <span className="text-xs font-bold tracking-[0.3em] text-white/40 uppercase">— {quote.author}</span>
                      <LikeButton targetType="note" targetId={quote.id} initialCount={quote.likes_count} className="scale-75 origin-right !bg-transparent !border-none !px-0" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case ViewState.ADMIN:
        return <Admin />;
      case ViewState.ARCHIVE:
        return (
          <div className="py-12">
            <h2 className="text-6xl font-bold tracking-tighter mb-16">归档文章</h2>
            {loading ? (
              <div className="text-center text-white/40 py-12">加载中...</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {posts.map((post, i) => (
                  <div key={post.id} className="glass p-8 rounded-[2.5rem] flex items-center justify-between group cursor-pointer hover:bg-white/[0.08] transition-all border border-white/5 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 50}ms` }} onClick={() => setSelectedPost(post)}>
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
      case ViewState.ABOUT:
        return (
          <div className="max-w-3xl py-12 relative">
            <div className="relative z-10">
              <h2 className="text-7xl font-bold tracking-tighter mb-10">关于我.</h2>
              <p className="text-2xl text-white/60 leading-relaxed font-light mb-16">Aura 是一个极简主义的数字避风港，在这里美学与智能相遇。我们旨在重新探讨极简美学与人工智能之间的和谐共生。</p>
              <div className="h-[1px] w-full bg-white/10 mb-16" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div>
                  <h4 className="text-xs uppercase tracking-[0.3em] text-white/20 mb-6 font-bold">设计理念</h4>
                  <p className="text-white/60 font-light leading-relaxed">追求空间感、诗意以及克制的智能交互。每一像素都经过深思熟虑。</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-[0.3em] text-white/20 mb-6 font-bold">底层驱动</h4>
                  <p className="text-white/60 font-light leading-relaxed">Powered by Gemini 3 Flash Pro. 为内容探索提供深度见解。</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-40">
            <section>
              <div className="max-w-3xl mb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <h4 className="text-white/20 uppercase tracking-[0.5em] text-[10px] font-black mb-8">Personal Space</h4>
                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[0.95]">探索 <br /><span className="text-white/20 italic">纯粹瞬间.</span></h2>
                <p className="text-lg text-white/30 font-light max-w-lg leading-relaxed">在这里，我们探索技术、建筑与人类情感之间那些无形的联系。</p>
              </div>
              {loading ? (
                <div className="text-center text-white/40 py-12">加载中...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.slice(0, 6).map((post, i) => (
                    <div key={post.id} className="animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${i * 100}ms` }}>
                      <BlogCard post={post} onClick={() => setSelectedPost(post)} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 主页留言板 */}
            <HomepageComments />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen selection:bg-white/20 selection:text-white">
      {/* Toast Notification - Apple Dynamic Island Style */}
      <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 rounded-full bg-[#1a1a1a]/60 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'}`}>
        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
        <span className="text-xs font-medium tracking-wide text-white/90">{toast.msg}</span>
      </div>

      <nav className={`fixed top-8 inset-x-0 z-[60] px-4 md:px-6 flex justify-center transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? 'translate-y-[-10px] scale-[0.96]' : 'translate-y-0'}`}>
        <div className={`flex items-center gap-0.5 md:gap-1.5 p-1.5 md:p-2 rounded-full glass transition-all duration-1000 ${scrolled ? 'shadow-[0_40px_100px_rgba(0,0,0,0.7)] bg-black/50 border-white/15 backdrop-blur-[40px]' : ''}`}>
          <button onClick={() => navigateTo(ViewState.FEED)} className="group px-3 md:px-6 py-2.5 text-xs md:text-sm font-bold tracking-tight hover:bg-white/10 rounded-full transition-all duration-500 flex items-center gap-2 md:gap-3 active:scale-95">
            <div className="relative w-2 h-2 md:w-2.5 md:h-2.5 flex-shrink-0"><div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20 scale-150" /><div className="relative w-full h-full bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)]" /></div>
            <span className="group-hover:translate-x-0.5 transition-transform hidden xs:inline">Aura</span>
          </button>
          <div className="h-4 md:h-5 w-[1px] bg-white/10 mx-1 md:mx-2" />
          {[{ label: 'NOTES', view: ViewState.NOTEBOOK }, { label: 'ARCHIVE', view: ViewState.ARCHIVE }, { label: 'ABOUT', view: ViewState.ABOUT }].map(item => (
            <button key={item.label} onClick={() => navigateTo(item.view)} className={`px-3 md:px-5 py-2.5 text-[9px] md:text-[11px] uppercase tracking-[0.2em] font-black rounded-full transition-all duration-500 active:scale-95 whitespace-nowrap ${view === item.view && !selectedPost ? 'bg-white text-black shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>{item.label}</button>
          ))}
        </div>
      </nav>

      <main className="relative pt-44 md:pt-56 pb-48 px-6 md:px-8 max-w-7xl mx-auto">
        <div key={selectedPost ? `post-${selectedPost.id}` : `view-${view}`} className="view-transition">{renderContent()}</div>
      </main>

      <Assistant />
      <InteractiveParticles />

      <footer className="py-24 md:py-40 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.01]">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="text-4xl font-bold tracking-tighter mb-12 opacity-10 select-none grayscale contrast-200">AURA</div>
          <div className="flex flex-row justify-center items-center gap-8 md:gap-20 text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">
            {[{ id: 'qq', label: 'QQ', value: CONTACT_INFO.QQ }, { id: 'wx', label: 'WX', value: CONTACT_INFO.WX }, { id: 'mail', label: 'MAIL', value: CONTACT_INFO.MAIL }].map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleCopy(contact.value, contact.label)}
                className="group relative overflow-hidden h-8 w-[5em] md:w-[6em] focus:outline-none"
              >
                {/* Default Text (Slides up on hover) */}
                <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-y-full group-active:scale-90">
                  {contact.label}
                </div>

                {/* Hover Text (Slides up from bottom) */}
                <div className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0 group-active:scale-90 text-white font-bold">
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

export default App;
