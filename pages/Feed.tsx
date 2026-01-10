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

  // 固定显示最新的 4 篇文章
  const latestPosts = sortedPosts.slice(0, 4);

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
        ease: "easeOut" as const,
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
        ease: "easeOut" as const
      }
    }
  };

  const fadeInReveal = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.8, ease: "easeOut" as const }
  };

  return (
    <motion.div 
      className="space-y-16 md:space-y-64 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 1. Hero 区域 - 移动端简化 */}
      <motion.section
        {...fadeInReveal}
        className="min-h-[50vh] md:min-h-[60vh] flex flex-col md:flex-row items-center gap-8 md:gap-24"
        variants={itemVariants}
      >
        <div className="flex-1 space-y-6 md:space-y-10">
          <div className="space-y-4 md:space-y-6">
            <h4 className="text-white/20 uppercase tracking-[0.4em] md:tracking-[0.6em] text-[9px] md:text-[10px] font-black flex items-center gap-3 md:gap-4">
              <span className="w-6 md:w-8 h-[1px] bg-white/10" />
              Digital Sanctuary
            </h4>
            <h1 className="text-4xl md:text-8xl font-black tracking-tighter leading-[0.9] md:leading-[0.85] text-white">
              Aura <br />
              <span className="text-white/20 italic font-light">Laboratory.</span>
            </h1>
          </div>
          <p className="text-base md:text-xl text-white/40 font-light max-w-md leading-relaxed border-l-2 border-white/5 pl-4 md:pl-8 py-2">
            探索技术与情感之间的无形联系。
          </p>
          {/* 移动端隐藏滚动按钮 */}
          <div className="hidden md:flex items-center gap-8 pt-4">
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

        {/* Hero 右侧 - 移动端简化 */}
        <div className="flex-[1.2] w-full flex justify-center items-center relative min-h-[200px] md:min-h-[400px]">
          <div className="absolute inset-0 bg-white/[0.02] blur-3xl rounded-full opacity-50" />

          <div className="relative z-10 w-full max-w-lg flex flex-col space-y-6 md:space-y-12">
            <div className="flex items-center gap-2 md:gap-3 opacity-60">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/50 rounded-full" />
              <span className="text-[9px] md:text-[10px] font-black tracking-[0.15em] md:tracking-[0.2em] text-white uppercase">
                Daily Note
              </span>
            </div>

            <div className="space-y-3 md:space-y-6">
              <h3 className="text-xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                {(randomNote as any).title || (randomNote as any).text?.substring(0, 30) + '...'}
              </h3>
              <p className="text-sm md:text-xl font-light text-white/70 leading-relaxed line-clamp-3 md:line-clamp-none">
                {(randomNote as any).content || (randomNote as any).text}
              </p>
            </div>

            <div className="flex justify-end pt-2 md:pt-4 border-t border-white/5">
              <p className="text-[9px] md:text-[10px] font-mono text-white/30 uppercase tracking-widest">
                {(randomNote as any).date || new Date().toLocaleDateString()}
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

      {/* 3. 画廊网格 - 固定 4 篇，黄金比例布局 */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      >
        <div className="flex items-end justify-between mb-6 md:mb-12 px-1 md:px-2">
          <h2 className="text-base md:text-xl font-light tracking-widest text-white/40 uppercase">Latest Posts</h2>
          <div className="text-[9px] md:text-[10px] font-mono text-white/20">{latestPosts.length} articles</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {latestPosts.map((post, i) => (
            <motion.div
              key={post.id}
              className="group"
              variants={itemVariants}
              whileHover={{ 
                y: -4,
                transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }
              }}
            >
              <motion.div
                className="rounded-xl md:rounded-2xl transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.01 }}
              >
                <BlogCard post={post} onClick={() => onSelectPost(post)} />
              </motion.div>
              {/* 底部描述 */}
              <div className="mt-2 md:mt-4 flex justify-between items-center opacity-40 px-1">
                <span className="text-[9px] md:text-[10px] uppercase tracking-widest">{post.date}</span>
                <span className="text-[9px] md:text-[10px] uppercase tracking-widest">{post.readingTime}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 4. 主页留言板 */}
      <motion.div variants={itemVariants}>
        <HomepageComments />
      </motion.div>
    </motion.div>
  );
};

export default Feed;
