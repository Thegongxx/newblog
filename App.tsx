
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
        <div className="animate-[fadeSlideUp_0.8s_cubic-bezier(0.16,1,0.3,1)] max-w-4xl mx-auto">
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
      case ViewState.ARCHIVE:
        return (
          <div className="animate-[fadeSlideUp_0.6s_ease-out] py-12">
            <h2 className="text-6xl font-bold tracking-tighter mb-16">The Archive</h2>
            <div className="grid grid-cols-1 gap-4">
              {BLOG_POSTS.map(post => (
                <div 
                  key={post.id} 
                  className="glass p-8 rounded-[2.5rem] flex items-center justify-between group cursor-pointer hover:bg-white/[0.08] transition-all"
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
      case ViewState.NOTEBOOK:
        return (
          <div className="animate-[fadeSlideUp_0.6s_ease-out] py-12">
            <h2 className="text-6xl font-bold tracking-tighter mb-6">Notebook</h2>
            <p className="text-white/40 text-xl font-light mb-16 max-w-xl">A collection of scattered thoughts, code snippets, and daily observations.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1,2,3,4].map(i => (
                 <div key={i} className="glass p-10 rounded-[3rem] space-y-6 hover:translate-y-[-8px] transition-transform duration-500">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 font-bold italic">#{i}</div>
                    <h3 className="text-xl font-bold tracking-tight">System Dynamics in Minimalist UI</h3>
                    <p className="text-white/40 leading-relaxed font-light">Why do some interfaces feel heavy while others feel like air? Exploring the physics of motion design.</p>
                    <div className="pt-6 border-t border-white/5 text-[10px] text-white/20 uppercase tracking-[0.2em]">Updated 2 days ago</div>
                 </div>
               ))}
            </div>
          </div>
        );
      case ViewState.ABOUT:
        return (
          <div className="animate-[fadeSlideUp_0.6s_ease-out] max-w-2xl py-12">
            <h2 className="text-7xl font-bold tracking-tighter mb-10">Hello.</h2>
            <p className="text-2xl text-white/60 leading-relaxed font-light mb-12">
              Aura is a digital sanctuary for those who appreciate the intersection of high-performance technology and poetic design.
            </p>
            <div className="h-[1px] w-full bg-white/10 mb-12" />
            <div className="grid grid-cols-2 gap-12">
               <div>
                 <h4 className="text-xs uppercase tracking-widest text-white/20 mb-4 font-bold">Inspiration</h4>
                 <p className="text-white/60 font-light italic">Apple, Dieter Rams, Bauhaus, Neon Genesis Evangelion.</p>
               </div>
               <div>
                 <h4 className="text-xs uppercase tracking-widest text-white/20 mb-4 font-bold">Tech Stack</h4>
                 <p className="text-white/60 font-light italic">React, Gemini AI, Tailwind, Framer Spirit.</p>
               </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-40">
            <section className="animate-[fadeSlideUp_1s_ease-out]">
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
      {/* Dynamic Floating Nav */}
      <nav className={`fixed top-8 inset-x-0 z-[60] px-6 flex justify-center transition-transform duration-500 ${scrolled ? 'translate-y-[-10px]' : 'translate-y-0'}`}>
        <div className={`flex items-center gap-1 p-1.5 rounded-full glass transition-all duration-700 ${scrolled ? 'shadow-[0_20px_40px_rgba(0,0,0,0.5)] scale-95' : ''}`}>
          <button 
            onClick={() => navigateTo(ViewState.FEED)}
            className="px-6 py-2.5 text-sm font-bold tracking-tight hover:bg-white/10 rounded-full transition-colors flex items-center gap-3"
          >
            <div className="w-2.5 h-2.5 bg-white rounded-full" />
            Aura
          </button>
          
          <div className="h-4 w-[1px] bg-white/10 mx-2" />

          {[
            {label: 'Archive', view: ViewState.ARCHIVE},
            {label: 'Notebook', view: ViewState.NOTEBOOK},
            {label: 'About', view: ViewState.ABOUT}
          ].map(item => (
            <button 
              key={item.label}
              onClick={() => navigateTo(item.view)}
              className={`px-5 py-2.5 text-xs font-semibold rounded-full transition-all duration-300 ${view === item.view ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              {item.label}
            </button>
          ))}
          
          <button className="ml-2 p-2.5 hover:bg-white/10 rounded-full transition-colors text-white/30">
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
          <div className="text-4xl font-bold tracking-tighter mb-12 opacity-20">Aura</div>
          <div className="flex gap-16 text-[11px] uppercase tracking-[0.4em] font-bold text-white/30">
            <a href="#" className="hover:text-white transition-colors underline-offset-8 hover:underline">Twitter</a>
            <a href="#" className="hover:text-white transition-colors underline-offset-8 hover:underline">Instagram</a>
            <a href="#" className="hover:text-white transition-colors underline-offset-8 hover:underline">Mail</a>
          </div>
          <p className="mt-24 text-[9px] text-white/10 tracking-[0.5em] uppercase font-medium">
            Designed for clarity &copy; 2024
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.98); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .prose blockquote {
          quotes: none;
          font-style: italic;
          color: rgba(255,255,255,0.9);
          border-left-width: 3px;
          border-color: rgba(255,255,255,0.1);
          padding-left: 2rem;
          margin: 3rem 0;
        }
      `}</style>
    </div>
  );
};

export default App;
