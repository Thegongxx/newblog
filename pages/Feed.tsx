import React, { useMemo } from 'react';
import BlogCard from '../components/BlogCard';
import HomepageComments from '../components/HomepageComments';
import { Post } from '../types';
import { QUOTES_DATA, ICONS } from '../constants';

interface FeedProps {
  posts: Post[];
  loading: boolean;
  onSelectPost: (post: Post) => void;
}

const Feed: React.FC<FeedProps> = ({ posts, loading, onSelectPost }) => {
  const randomQuote = useMemo(() => {
    return QUOTES_DATA[Math.floor(Math.random() * QUOTES_DATA.length)];
  }, []);

  return (
    <div className="space-y-32 md:space-y-64">
      {/* 1. 全新分屏 Hero 区域 */}
      <section className="min-h-[60vh] flex flex-col md:flex-row items-center gap-16 md:gap-24">
        <div className="flex-1 space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="space-y-6">
            <h4 className="text-white/20 uppercase tracking-[0.6em] text-[10px] font-black flex items-center gap-4">
              <span className="w-8 h-[1px] bg-white/10" />
              Digital Sanctuary
            </h4>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-white">
              Aura <br />
              <span className="text-white/20 italic font-light">Laboratory.</span>
            </h1>
          </div>
          <p className="text-xl text-white/40 font-light max-w-md leading-relaxed border-l-2 border-white/5 pl-8 py-2">
            在这里，我们探索技术、建筑与人类情感之间那些无形的联系。一个致力于纯粹体验的数字空间。
          </p>
          <div className="flex items-center gap-8 pt-4">
            <button className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors">
              Scroll to Explore
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1V11M6 11L1 6M6 11L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </button>
          </div>
        </div>

        {/* Hero 右侧精选展示 */}
        {!loading && posts.length > 0 && (
          <div className="flex-[1.2] w-full animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
            <BlogCard post={posts[0]} onClick={() => onSelectPost(posts[0])} featured />
          </div>
        )}
      </section>

      {/* 2. Bento 文章网格 */}
      <section>
        <div className="flex items-end justify-between mb-20">
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tight uppercase">Latest Artifacts.</h2>
            <div className="h-1 w-12 bg-white/10" />
          </div>
          <p className="text-white/20 text-[10px] uppercase tracking-[0.4em] font-bold hidden md:block">Sorted by Chronology</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[450px] rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {posts.slice(1, 7).map((post, i) => {
              // 构建一个动态的 Bento 布局：某些卡片占据更多空间
              const isLarge = i === 1 || i === 4;
              return (
                <div
                  key={post.id}
                  className={`animate-in fade-in slide-in-from-bottom-12 duration-1000 ${isLarge ? 'md:col-span-2 lg:col-span-3' : 'md:col-span-2 lg:col-span-2'}`}
                  style={{ animationDelay: `${(i + 1) * 150}ms` }}
                >
                  <BlogCard post={post} onClick={() => onSelectPost(post)} featured={isLarge} />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. 格言模块 (静谧时刻) */}
      <section className="relative py-32 border-y border-white/5 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
          <div className="flex justify-center">{ICONS.QUOTES}</div>
          <blockquote className="text-3xl md:text-5xl font-light tracking-tight text-white/80 leading-tight italic px-8">
            “{randomQuote.text}”
          </blockquote>
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.5em] font-black text-white/20">— {randomQuote.author}</p>
            <p className="text-[8px] text-white/10 font-medium">{randomQuote.date}</p>
          </div>
        </div>
      </section>

      {/* 4. 主页留言板 */}
      <HomepageComments />
    </div>
  );
};

export default Feed;
