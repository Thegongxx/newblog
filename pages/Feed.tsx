import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
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
  // 按时间排序，最新的文章在前面
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [posts]);

  // 第一篇作为 Hero 展示，其余作为 Bento 网格
  const featuredPost = sortedPosts[0] || null;
  const bentoPosts = sortedPosts.slice(1, 5); // 只取 4 篇，保持约两行


  const randomQuote = useMemo(() => {
    return QUOTES_DATA[Math.floor(Math.random() * QUOTES_DATA.length)];
  }, []);

  const fadeInReveal = {
    initial: { opacity: 0, y: 30, filter: 'blur(10px)' },
    whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as any }
  };

  return (
    <div className="space-y-32 md:space-y-64 overflow-hidden">
      {/* 1. 全新分屏 Hero 区域 */}
      <motion.section
        {...fadeInReveal}
        className="min-h-[60vh] flex flex-col md:flex-row items-center gap-16 md:gap-24"
      >
        <div className="flex-1 space-y-10">
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
            <button
              onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
              className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors"
            >
              Scroll to Explore
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1V11M6 11L1 6M6 11L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </button>
          </div>
        </div>

        {/* Hero 右侧精选展示 */}
        {!loading && featuredPost && (
          <div className="flex-[1.2] w-full">
            <BlogCard post={featuredPost} onClick={() => onSelectPost(featuredPost)} featured />
          </div>
        )}
      </motion.section>

      {/* 2. Bento 文章网格 */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="flex items-end justify-between mb-24 reveal-text">
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tight uppercase">Latest Artifacts.</h2>
            <div className="h-1 w-12 bg-white/10" />
          </div>
          <p className="text-white/20 text-[10px] uppercase tracking-[0.4em] font-bold hidden md:block">Curated Selection</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[450px] rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-12">
            {/* 格言卡片 - 完全无边框，融入背景 */}
            <motion.div
              key="quote-card"
              {...fadeInReveal}
              className="md:col-span-2 lg:col-span-2 group relative h-[450px] p-10 flex flex-col justify-center items-center text-center"
            >
              <div className="relative z-10 space-y-8">
                <div className="flex justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-xl md:text-2xl font-light italic text-white/70 leading-snug">
                  “{randomQuote.text}”
                </p>
                <p className="text-[9px] uppercase tracking-[0.4em] font-black text-white/25">— {randomQuote.author}</p>
              </div>
            </motion.div>

            {/* 最新文章卡片 */}
            {bentoPosts.map((post, i) => {
              const isLarge = i === 1; // 第二篇稍大一些
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1,
                    delay: i * 0.1,
                    ease: [0.22, 1, 0.36, 1] as any
                  }}
                  className={`${isLarge ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-2 lg:col-span-2'}`}
                >
                  <BlogCard post={post} onClick={() => onSelectPost(post)} />
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.section>


      {/* 4. 主页留言板 */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      >
        <HomepageComments />
      </motion.div>
    </div>
  );
};

export default Feed;
