import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import BlogCard from '../components/BlogCard';
import HomepageComments from '../components/HomepageComments';
import { Post } from '../types';
import { getAllNotes } from '../utils/notes';

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

  // 使用真实 Markdown 笔记数据
  const notes = useMemo(() => getAllNotes(), []);

  const randomNote = useMemo(() => {
    // 假如没有笔记，提供一个 fallback，或者 just return null (UI handle it)
    if (notes.length === 0) {
      return {
        id: 'default',
        title: 'Welcome',
        content: 'Digital Sanctuary awaits your thoughts.',
        date: new Date().toLocaleDateString(),
        tags: ['AURA']
      };
    }
    return notes[Math.floor(Math.random() * notes.length)];
  }, [notes]);

  // Google Material Design 动画配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0.0, 0.2, 1],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  };

  const fadeInReveal = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }
  };

  return (
    <div className="space-y-32 md:space-y-64 overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
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

        {/* Hero 右侧：真实 Note 推荐 (Real File Content) - Asymmetric Layout */}
        <div className="flex-[1.2] w-full flex justify-center items-center relative min-h-[400px]">
          {/* 背景装饰：微弱的光晕 */}
          <div className="absolute inset-0 bg-white/[0.02] blur-3xl rounded-full opacity-50" />

          <div className="relative z-10 w-full max-w-lg flex flex-col space-y-12">
            {/* Top: Label & Tags (Left Aligned) */}
            <div className="flex items-center gap-3 opacity-60">
              <span className="w-2 h-2 bg-white/50 rounded-full" />
              <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase mr-4">
                Daily Note
              </span>
              {randomNote.tags.map(tag => (
                <span key={tag} className="text-[10px] uppercase tracking-widest text-white/30">#{tag}</span>
              ))}
            </div>

            {/* Middle: Content (Left Aligned) */}
            <div className="space-y-6">
              <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight text-left">
                {randomNote.title}
              </h3>
              <p className="text-lg md:text-xl font-light text-white/70 leading-relaxed max-w-md text-left whitespace-pre-line">
                {randomNote.content}
              </p>
            </div>

            {/* Bottom: Date (Right Aligned) */}
            <div className="flex justify-end pt-4 border-t border-white/5">
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                Recorded on {randomNote.date}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. Loading State Only */}
      {loading && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mb-24"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[450px] rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        </motion.section>
      )}

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
      <HomepageComments />
    </div>
  );
};

export default Feed;
