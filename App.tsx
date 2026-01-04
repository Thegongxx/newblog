
import React, { useState, useEffect } from 'react';
import Intro from './components/Intro';
import Assistant from './components/Assistant';
import BlogCard from './components/BlogCard';
import { BLOG_POSTS, ICONS } from './constants';
import { ViewState, Post } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.INTRO);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [scrolled, setScrolled] = useState(false);

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

  if (view === ViewState.INTRO) {
    return <Intro onComplete={() => setView(ViewState.FEED)} />;
  }

  const renderContent = () => {
    if (selectedPost) {
      return (
        <div className="view-transition max-w-4xl mx-auto">
          <button 
            onClick={() => setSelectedPost(null)}
            className="group flex items-center gap-2 text-white/40 hover:text-white transition-all mb-12 px-5 py-2 rounded-full glass"
          >
            <div className="rotate-180 group-hover:-translate-x-1 transition-transform">{ICONS.CHEVRON_RIGHT}</div>
            <span className="text-sm font-medium">Back to feed</span>
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
          <div className="view-transition py-12">
            <h2 className="text-7xl font-bold tracking-tighter mb-16">Selected <br/><span className="text-white/30 italic">Repositories.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: 'Aura UI', tech: 'React, Tailwind', desc: 'A spatial design system for personal branding.', stars: '1.2k' },
                { name: 'GenAI Service', tech: 'TypeScript, Gemini', desc: 'Universal wrapper for Google Gemini models.', stars: '840' },
                { name: 'Fluid Motion', tech: 'GSAP, Canvas', desc: 'Physics-based animation engine for smooth UIs.', stars: '2.4k' }
              ].map((proj, i) => (
                <div key={i} className="group glass p-10 rounded-[3rem] space-y-8 hover:bg-white/[0.08] transition-all duration-700 cursor-pointer border border-white/5 hover:border-white/20 hover:-translate-y-2">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
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
          <div className="view-transition py-12">
            <h2 className="text-6xl font-bold tracking-tighter mb-16">The Archive</h2>
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
          <div className="view-transition max-w-2xl py-12">
            <h2 className="text-7xl font-bold tracking-tighter mb-10">Hello.</h2>
            <p className="text-2xl text-white/60 leading-relaxed font-light mb-12">
              Aura is a digital sanctuary where minimal aesthetics meet high-performance intelligence.
            </p>
            <div className="h-[1px] w-full bg-white/10 mb-12" />
            <div className="grid grid-cols-2 gap-12">
               <div>
                 <h4 className="text-xs uppercase tracking-widest text-white/20 mb-4 font-bold">Concept</h4>
                 <p className="text-white/60 font-light italic">Spatial, Poetic, Intelligent.</p>
               </div>
               <div>
                 <h4 className="text-xs uppercase tracking-widest text-white/20 mb-4 font-bold">Intelligence</h4>
                 <p className="text-white/60 font-light italic">Powered by Gemini 3 Flash.</p>
               </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-40 view-transition">
            <section>
              <div className="max-w-3xl mb-24">
                <h4 className="text-white/20 uppercase tracking-[0.5em] text-[10px] font-black mb-8">Personal Space</h4>
                <h2 className="text-6xl md:text-[8rem] font-bold tracking-tighter mb-12 leading-[0.85]">
                  Curating <br/><span className="text-white/30 italic">Pure Moments.</span>
                </h2>
                <p className="text-xl md:text-2xl text-white/40 font-light max-w-xl">
                  Exploring the invisible lines that connect technology, architecture, and human emotion.
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
      {/* 动态悬浮导航栏：增加弹性反馈 */}
      <nav className={`fixed top-8 inset-x-0 z-[60] px-6 flex justify-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${scrolled ? 'translate-y-[-10px] scale-[0.96]' : 'translate-y-0'}`}>
        <div className={`flex items-center gap-1.5 p-2 rounded-full glass transition-all duration-700 ${scrolled ? 'shadow-[0_40px_100px_rgba(0,0,0,0.7)] bg-black/50 border-white/15 backdrop-blur-[40px]' : ''}`}>
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
            {label: 'Works', view: ViewState.PROJECTS},
            {label: 'Archive', view: ViewState.ARCHIVE},
            {label: 'About', view: ViewState.ABOUT}
          ].map(item => (
            <button 
              key={item.label}
              onClick={() => navigateTo(item.view)}
              className={`px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] font-black rounded-full transition-all duration-500 active:scale-95 ${view === item.view ? 'bg-white text-black shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
            >
              {item.label}
            </button>
          ))}
          
          <button className="ml-2 p-3 hover:bg-white/10 rounded-full transition-all text-white/20 active:scale-90">
            {ICONS.SEARCH}
          </button>
        </div>
      </nav>

      <main className="relative pt-56 pb-64 px-8 max-w-7xl mx-auto">
        {renderContent()}
      </main>

      <Assistant />

      <footer className="py-40 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="text-4xl font-bold tracking-tighter mb-12 opacity-10 select-none">Aura</div>
          <div className="flex gap-16 text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Mail</a>
          </div>
          <p className="mt-24 text-[9px] text-white/5 tracking-[0.5em] uppercase font-medium">
            Designed for clarity &copy; 2024
          </p>
        </div>
      </footer>

      <style>{`
        .view-transition {
          animation: fadeScaleIn 1.2s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: translateY(30px) scale(0.96); filter: blur(20px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
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
