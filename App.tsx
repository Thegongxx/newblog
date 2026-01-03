
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
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (view === ViewState.INTRO) {
    return <Intro onComplete={() => setView(ViewState.FEED)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Dynamic Header */}
      <nav className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 px-6 py-4 flex items-center justify-between ${scrolled ? 'bg-black/40 backdrop-blur-xl py-3 border-b border-white/5' : 'bg-transparent'}`}>
        <div 
          className="text-xl font-bold tracking-tighter cursor-pointer flex items-center gap-2"
          onClick={() => { setView(ViewState.FEED); setSelectedPost(null); window.scrollTo({top: 0, behavior: 'smooth'}); }}
        >
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full" />
          </div>
          Aura
        </div>

        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-white/60">
          {['Archive', 'Notebook', 'Philosophy', 'About'].map(item => (
            <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
          ))}
        </div>

        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          {ICONS.SEARCH}
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="relative pt-32 pb-48 px-6 max-w-7xl mx-auto">
        {selectedPost ? (
          /* Post Detail View */
          <div className="animate-[fadeUp_0.8s_ease-out]">
            <button 
              onClick={() => { setView(ViewState.FEED); setSelectedPost(null); }}
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group"
            >
              <div className="p-2 rounded-full border border-white/5 transition-colors group-hover:border-white/20">
                <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              返回列表
            </button>

            <header className="max-w-3xl mb-16">
              <div className="flex items-center gap-4 text-white/40 text-sm font-medium mb-6">
                <span>{selectedPost.date}</span>
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                <span>{selectedPost.readingTime} 阅读</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                {selectedPost.title}
              </h1>
              <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-light">
                {selectedPost.excerpt}
              </p>
            </header>

            <div className="rounded-[3rem] overflow-hidden mb-20 aspect-video shadow-2xl">
              <img 
                src={selectedPost.image} 
                alt={selectedPost.title} 
                className="w-full h-full object-cover"
              />
            </div>

            <article 
              className="max-w-3xl mx-auto prose prose-invert prose-lg prose-p:text-white/70 prose-p:leading-relaxed prose-headings:text-white"
              dangerouslySetInnerHTML={{ __html: selectedPost.content }}
            />
          </div>
        ) : (
          /* Feed View */
          <div className="space-y-32">
            <section className="animate-[fadeUp_1s_ease-out]">
              <h4 className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-bold mb-4">精选文章</h4>
              <h2 className="text-5xl md:text-8xl font-bold tracking-tighter mb-12 leading-[0.9]">
                记录 <br/><span className="text-white/40 italic">有意义</span> 的瞬间。
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {BLOG_POSTS.slice(0, 2).map(post => (
                  <BlogCard 
                    key={post.id}
                    post={post} 
                    onClick={() => { setSelectedPost(post); window.scrollTo(0, 0); }} 
                  />
                ))}
              </div>
            </section>

            <section className="animate-[fadeUp_1.2s_ease-out]">
              <div className="flex items-center justify-between mb-12">
                <h4 className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-bold">深度思考</h4>
                <a href="#" className="text-xs text-white/60 hover:text-white flex items-center gap-2">
                  查看全部 {ICONS.CHEVRON_RIGHT}
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {BLOG_POSTS.slice(2).map(post => (
                  <BlogCard key={post.id} post={post} onClick={() => { setSelectedPost(post); window.scrollTo(0,0); }} />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <Assistant />

      <footer className="border-t border-white/5 py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div>
            <div className="text-2xl font-bold tracking-tighter mb-4">Aura</div>
            <p className="text-white/40 max-w-xs text-sm leading-relaxed">
              探索设计、技术以及两者之间的空间。
            </p>
          </div>
          <div className="flex gap-20">
            <div className="flex flex-col gap-4 text-sm text-white/60">
              <span className="text-white font-bold uppercase tracking-widest text-[10px] mb-2">关注</span>
              <a href="#" className="hover:text-white transition-colors">微博</a>
              <a href="#" className="hover:text-white transition-colors">知乎</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 text-[10px] text-white/20 uppercase tracking-[0.2em] flex justify-between">
          <span>&copy; 2024 Aura Collective</span>
          <span>北京 &mdash; 上海</span>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
