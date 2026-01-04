
import React, { useState, useEffect, useRef } from 'react';
import Intro from './components/Intro';
import Assistant from './components/Assistant';
import BlogCard from './components/BlogCard';
import { BLOG_POSTS, PROJECTS_DATA, ICONS, CONTACT_INFO } from './constants';
import { ViewState, Post } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.INTRO);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [copyStatus, setCopyStatus] = useState<{id: string, count: number} | null>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (newView: ViewState) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedPost(null);
    setView(newView);
  };

  const handleCopy = (text: string, id: string) => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus(prev => ({
        id,
        count: (prev?.id === id ? prev.count + 1 : 0)
      }));
      
      copyTimeoutRef.current = setTimeout(() => {
        setCopyStatus(null);
      }, 1400);
    });
  };

  if (view === ViewState.INTRO) {
    return <Intro onComplete={() => setView(ViewState.FEED)} />;
  }

  const renderContent = () => {
    if (selectedPost) {
      return (
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setSelectedPost(null)}
            className="group flex items-center gap-2 text-white/40 hover:text-white transition-all mb-12 px-5 py-2 rounded-full glass active:scale-95"
          >
            <div className="rotate-180 group-hover:-translate-x-1 transition-transform">{ICONS.CHEVRON_RIGHT}</div>
            <span className="text-sm font-medium">返回列表</span>
          </button>

          <header className="mb-20">
            <div className="flex items-center gap-3 text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
              <span>{selectedPost.date}</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span>{selectedPost.category}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-10 leading-tight">
              {selectedPost.title}
            </h1>
            <div className="h-[2px] w-20 bg-white/20 mb-10" />
            <p className="text-xl md:text-2xl text-white/50 leading-relaxed font-light">
              {selectedPost.excerpt}
            </p>
          </header>

          <div className="rounded-[4rem] overflow-hidden mb-24 aspect-[16/9] glass">
            <img src={selectedPost.image} className="w-full h-full object-cover" />
          </div>

          <article 
            className="prose prose-invert prose-p:text-white/60 prose-p:leading-[1.9] prose-p:text-xl prose-p:font-light prose-headings:font-bold prose-headings:tracking-tighter prose-blockquote:border-white/20 prose-blockquote:text-white/80"
            dangerouslySetInnerHTML={{ __html: selectedPost.content }}
          />
        </div>
      );
    }

    switch (view) {
      case ViewState.PROJECTS:
        return (
          <div className="py-12">
            <h2 className="text-7xl font-bold tracking-tighter mb-16">精选项目 <br/><span className="text-white/30 italic">Selected.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {PROJECTS_DATA.map((proj, i) => (
                <div key={i} className="group glass p-10 rounded-[3rem] space-y-8 hover:bg-white/[0.08] transition-all duration-700 cursor-pointer border border-white/5 hover:border-white/20 hover:-translate-y-2">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    </div>
                    <div className="px-4 py-1 rounded-full bg-white/5 text-[10px] font-bold text-white/30 border border-white/5">★ {proj.stars}</div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight mb-2 group-hover:text-blue-400 transition-colors">{proj.name}</h3>
                    <p className="text-white/40 leading-relaxed font-light text-sm">{proj.desc}</p>
                  </div>
                  <div className="pt-8 border-t border-white/5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-[10px] uppercase tracking-widest text-white/20">{proj.tech}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case ViewState.ARCHIVE:
        return (
          <div className="py-12">
            <h2 className="text-6xl font-bold tracking-tighter mb-16">归档文章</h2>
            <div className="grid grid-cols-1 gap-4">
              {BLOG_POSTS.map(post => (
                <div 
                  key={post.id} 
                  className="glass p-8 rounded-[2.5rem] flex items-center justify-between group cursor-pointer hover:bg-white/[0.08] transition-all border border-white/5"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="space-y-1">
                    <p className="text-white/30 text-[10px] uppercase tracking-widest">{post.date}</p>
                    <h3 className="text-2xl font-semibold group-hover:translate-x-2 transition-transform duration-500">{post.title}</h3>
                  </div>
                  <div className="p-4 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {ICONS.CHEVRON_RIGHT}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case ViewState.ABOUT:
        return (
          <div className="max-w-2xl py-12">
            <h2 className="text-7xl font-bold tracking-tighter mb-10">关于我.</h2>
            <p className="text-2xl text-white/60 leading-relaxed font-light mb-12">
              Aura 是一个极简主义的数字避风港，在这里美学与智能相遇。
            </p>
            <div className="h-[1px] w-full bg-white/10 mb-12" />
            <div className="grid grid-cols-2 gap-12">
               <div>
                 <h4 className="text-xs uppercase tracking-widest text-white/20 mb-4 font-bold">设计理念</h4>
                 <p className="text-white/60 font-light italic">空间感, 诗意, 智能交互。</p>
               </div>
               <div>
                 <h4 className="text-xs uppercase tracking-widest text-white/20 mb-4 font-bold">底层驱动</h4>
                 <p className="text-white/60 font-light italic">Powered by Gemini 3 Flash.</p>
               </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-40">
            <section>
              <div className="max-w-3xl mb-24">
                <h4 className="text-white/20 uppercase tracking-[0.5em] text-[10px] font-black mb-8">Personal Space</h4>
                <h2 className="text-6xl md:text-[8rem] font-bold tracking-tighter mb-12 leading-[0.85]">
                  探索 <br/><span className="text-white/30 italic">纯粹瞬间.</span>
                </h2>
                <p className="text-xl md:text-2xl text-white/40 font-light max-w-xl">
                  在这里，我们探索技术、建筑与人类情感之间那些无形的联系。
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {BLOG_POSTS.map(post => (
                  <BlogCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
                ))}
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <nav className={`fixed top-8 inset-x-0 z-[60] px-6 flex justify-center transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? 'translate-y-[-10px] scale-[0.96]' : 'translate-y-0'}`}>
        <div className={`flex items-center gap-1.5 p-2 rounded-full glass transition-all duration-1000 ${scrolled ? 'shadow-[0_40px_100px_rgba(0,0,0,0.7)] bg-black/50 border-white/15 backdrop-blur-[40px]' : ''}`}>
          <button 
            onClick={() => navigateTo(ViewState.FEED)}
            className="group px-6 py-2.5 text-sm font-bold tracking-tight hover:bg-white/10 rounded-full transition-all duration-500 flex items-center gap-3 active:scale-95"
          >
            <div className="relative w-2.5 h-2.5">
               <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20 scale-150" />
               <div className="relative w-full h-full bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
            </div>
            <span className="group-hover:translate-x-0.5 transition-transform">Aura</span>
          </button>
          
          <div className="h-5 w-[1px] bg-white/10 mx-2" />

          {[
            {label: '作品', view: ViewState.PROJECTS},
            {label: '归档', view: ViewState.ARCHIVE},
            {label: '关于', view: ViewState.ABOUT}
          ].map(item => (
            <button 
              key={item.label}
              onClick={() => navigateTo(item.view)}
              className={`px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] font-black rounded-full transition-all duration-500 active:scale-95 ${view === item.view && !selectedPost ? 'bg-white text-black shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
            >
              {item.label}
            </button>
          ))}
          
          <button className="ml-2 p-3 hover:bg-white/10 rounded-full transition-all text-white/20 active:scale-90">
            {ICONS.SEARCH}
          </button>
        </div>
      </nav>

      <main className="relative pt-56 pb-48 px-8 max-w-7xl mx-auto">
        <div key={selectedPost ? `post-${selectedPost.id}` : `view-${view}`} className="view-transition">
          {renderContent()}
        </div>
      </main>

      <Assistant />

      <footer className="py-24 md:py-40 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.01]">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="text-4xl font-bold tracking-tighter mb-12 opacity-10 select-none grayscale contrast-200">Aura</div>
          
          {/* 联系方式容器：移动端缩小 gap，确保居中紧凑 */}
          <div className="flex flex-row justify-center items-center gap-8 md:gap-20 text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">
            {[
              { id: 'qq', label: 'QQ', value: CONTACT_INFO.QQ },
              { id: 'wx', label: 'WX', value: CONTACT_INFO.WX },
              { id: 'mail', label: 'MAIL', value: CONTACT_INFO.MAIL }
            ].map((contact) => (
              <button 
                key={contact.id}
                onClick={() => handleCopy(contact.value, contact.id)} 
                className="group relative overflow-hidden h-8 min-w-[3.5em] md:min-w-[5.5em] hover:text-white transition-all duration-300 active:scale-[0.8] active:translate-y-0.5 focus:outline-none"
              >
                <div className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform-gpu ${
                  copyStatus?.id === contact.id ? '-translate-y-full opacity-0 blur-sm scale-90' : 'translate-y-0 opacity-100 scale-100'
                }`}>
                  {contact.label}
                </div>
                
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform-gpu ${
                  copyStatus?.id === contact.id 
                    ? 'translate-y-0 opacity-100 blur-0 scale-100 text-blue-400' 
                    : 'translate-y-full opacity-0 blur-md scale-110'
                }`}>
                  <span 
                    key={copyStatus?.id === contact.id ? copyStatus.count : 'idle'}
                    className="animate-in zoom-in-75 slide-in-from-bottom-2 duration-300 shadow-[0_0_25px_rgba(59,130,246,0.4)] font-black italic tracking-widest text-[9px]"
                  >
                    COPY
                  </span>
                </div>
              </button>
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

      <style>{`
        .view-transition {
          animation: appleSoftEntrance 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          will-change: transform, opacity, filter;
        }

        @keyframes appleSoftEntrance {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.985);
            filter: blur(40px);
          }
          30% {
            opacity: 0.3;
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .prose blockquote {
          quotes: none;
          font-style: italic;
          color: rgba(255,255,255,0.95);
          border-left-width: 3px;
          border-color: rgba(255,255,255,0.2);
          padding-left: 3rem;
          margin: 5rem 0;
          background: linear-gradient(to right, rgba(255,255,255,0.02), transparent);
          border-radius: 0 2rem 2rem 0;
        }
      `}</style>
    </div>
  );
};

export default App;
