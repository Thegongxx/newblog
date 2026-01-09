import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import BlogCard from '../components/BlogCard';
import HomepageComments from '../components/HomepageComments';
import { Post } from '../types';
import { NOTES_DATA, ICONS } from '../constants';

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


  const randomNote = useMemo(() => {
    return NOTES_DATA[Math.floor(Math.random() * NOTES_DATA.length)];
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

        {/* Hero 右侧：随机 Note 推荐 (Inspiration) */}
        <div className="flex-[1.2] w-full flex justify-center items-center relative min-h-[400px]">
          {/* 背景装饰：微弱的光晕 */}
          <div className="absolute inset-0 bg-white/[0.02] blur-3xl rounded-full opacity-50" />

          <div className="relative z-10 w-full max-w-lg p-10 md:p-14 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[2.5rem] flex flex-col items-center text-center space-y-8 group hover:bg-white/[0.04] transition-all duration-700">
            {/* Note 标签 */}
            <div className="flex items-center gap-3 opacity-60">
              <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-black tracking-[0.2em] text-white uppercase">
                Daily Note
              </span>
              {randomNote.tags.map(tag => (
                <span key={tag} className="text-[10px] uppercase tracking-widest text-white/50">#{tag}</span>
              ))}
            </div>

            {/* Note 内容 */}
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">{randomNote.title}</h3>
              <div className="w-12 h-[1px] bg-white/10 mx-auto" />
              <p className="text-base font-light text-white/70 leading-relaxed">
                {randomNote.content}
              </p>
            </div>

            {/* Note 日期 */}
            <p className="text-[10px] font-mono text-white/20 pt-4">{randomNote.date}</p>

            {/* 装饰性引号背景 */}
            <div className="absolute top-6 left-6 opacity-5 pointer-events-none">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.068 14.017 15.442 14.017 14.017C14.017 9.388 16.49 7.632 19 6L20 8C18.332 8.632 17.5 10.632 17.5 12.017L21 12.017L21 21L14.017 21ZM5 21L5 18C5 16.068 5 15.442 5 14.017C5 9.388 7.49 7.632 10 6L11 8C9.332 8.632 8.5 10.632 8.5 12.017L12 12.017L12 21L5 21Z" /></svg>
            </div>
          </div>
        </div>
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
        ) : null}
      </motion.section>

      {/* 3. 画廊网格 (Pure Gallery) */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      >
        <div className="flex items-end justify-between mb-16 px-4">
          <h2 className="text-xl md:text-2xl font-light tracking-widest text-white/40 uppercase">Selected Works</h2>
          <div className="text-[10px] font-mono text-white/20">01 — 0{bentoPosts.length}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
          {bentoPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 1.2,
                delay: i * 0.2,
                ease: [0.22, 1, 0.36, 1] as any
              }}
              className="group"
            >
              <BlogCard post={post} onClick={() => onSelectPost(post)} />
              {/* 纯净的底部描述，移出卡片内部以增加留白 */}
              <div className="mt-6 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity duration-500 px-2">
                <span className="text-[10px] uppercase tracking-widest">{post.date}</span>
                <span className="text-[10px] uppercase tracking-widest">{post.readingTime}</span>
              </div>
            </motion.div>
          ))}
        </div>
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
