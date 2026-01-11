import { useMemo, memo, type FC } from 'react';
import { motion } from 'framer-motion';
import BlogCard from '../components/BlogCard';
import HomepageComments from '../components/HomepageComments';
import LikeButton from '../components/LikeButton';
import { Post } from '../types';
import { getAllNotes } from '../utils/notes';
import { useIsMobile } from '../hooks/useResponsive';

interface FeedProps {
  posts: Post[];
  loading: boolean;
  onSelectPost: (post: Post) => void;
}

const Feed: FC<FeedProps> = memo(({ posts, loading, onSelectPost }) => {
  const isMobile = useIsMobile();

  // 按时间排序，最新的文章在前面
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [posts]);

  // 固定显示最新的 4 篇文章
  const latestPosts = useMemo(() => sortedPosts.slice(0, 4), [sortedPosts]);

  // 使用真实 Markdown 笔记数据 - 优化性能
  const notes = useMemo(() => {
    try {
      return getAllNotes();
    } catch (error) {
      console.warn('Failed to load notes:', error);
      return [];
    }
  }, []); // 移除依赖，只在组件挂载时执行一次

  const randomNote = useMemo(() => {
    if (notes.length === 0) {
      return {
        id: 'default',
        title: 'Welcome',
        content: 'Digital Sanctuary awaits your thoughts.',
        date: new Date().toLocaleDateString(),
        tags: ['AURA']
      };
    }
    // 使用固定种子避免每次重新随机
    const index = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % notes.length;
    return notes[index];
  }, [notes]); // 每天更换一次

  // 移动端极简动画 - Google风格
  if (isMobile) {
    return (
      <div className="space-y-8">
        {/* 移动端简化Hero */}
        <section className="min-h-[40vh] flex flex-col justify-center space-y-6">
          <div className="space-y-4">
            <h4 className="text-white/30 uppercase tracking-[0.3em] text-[8px] font-bold">
              Digital Sanctuary
            </h4>
            <h1 className="text-3xl font-black tracking-tight leading-tight text-white">
              Aura <br />
              <span className="text-white/30 italic font-light">Laboratory.</span>
            </h1>
            <p className="text-sm text-white/50 font-light max-w-xs leading-relaxed">
              探索技术与情感之间的无形联系。
            </p>
          </div>
        </section>

        {/* 移动端简化Loading */}
        {loading && (
          <section className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 rounded-lg bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </section>
        )}

        {/* 移动端简化文章列表 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white/60 uppercase tracking-wide">Latest</h2>
            <div className="text-[10px] text-white/30">{latestPosts.length}</div>
          </div>

          <div className="space-y-4">
            {latestPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden active:bg-white/[0.04] transition-colors"
                onClick={() => onSelectPost(post)}
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-wide">
                    <span>{post.category}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{post.date}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-white/30 uppercase tracking-wide">
                      {post.readingTime}
                    </span>
                    {/* 使用统一的点赞按钮 */}
                    <LikeButton 
                      targetType="post" 
                      targetId={post.id} 
                      initialCount={post.likes_count || 0}
                      className="!bg-transparent !border-none !px-1 !py-0" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 移动端简化留言板 */}
        <section className="pt-8">
          <HomepageComments />
        </section>
      </div>
    );
  }

  // 桌面端保持原有复杂动画
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const
      }
    }
  };

  const fadeInReveal = {
    initial: { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-30px" },
    transition: { duration: 0.5, ease: "easeOut" as const }
  };

  return (
    <motion.div 
      className="space-y-16 md:space-y-64"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    >
      {/* 1. Hero 区域 - 桌面端完整版 */}
      <motion.section
        {...fadeInReveal}
        className="min-h-[60vh] flex flex-row items-center gap-24"
        variants={itemVariants}
      >
        <div className="flex-1 space-y-10">
          <div className="space-y-6">
            <h4 className="text-white/20 uppercase tracking-[0.6em] text-[10px] font-black flex items-center gap-4">
              <span className="w-8 h-[1px] bg-white/10" />
              Digital Sanctuary
            </h4>
            <h1 className="text-8xl font-black tracking-tighter leading-[0.85] text-white">
              Aura <br />
              <span className="text-white/20 italic font-light">Laboratory.</span>
            </h1>
          </div>
          <p className="text-xl text-white/40 font-light max-w-md leading-relaxed border-l-2 border-white/5 pl-8 py-2">
            探索技术与情感之间的无形联系。
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

        {/* Hero 右侧 */}
        <div className="flex-[1.2] w-full flex justify-center items-center relative min-h-[400px]">
          <div className="absolute inset-0 bg-white/[0.02] blur-3xl rounded-full opacity-50" />

          <div className="relative z-10 w-full max-w-lg flex flex-col space-y-12">
            <div className="flex items-center gap-3 opacity-60">
              <span className="w-2 h-2 bg-white/50 rounded-full" />
              <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase">
                Daily Note
              </span>
            </div>

            <div className="space-y-6">
              <h3 className="text-4xl font-bold text-white tracking-tight leading-tight">
                {(randomNote as any).title || (randomNote as any).text?.substring(0, 30) + '...'}
              </h3>
              <p className="text-xl font-light text-white/70 leading-relaxed">
                {(randomNote as any).content || (randomNote as any).text}
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5">
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                {(randomNote as any).date || new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. Loading State */}
      {loading && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-12"
        >
          <div className="grid grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[320px] rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        </motion.section>
      )}

      {/* 3. 画廊网格 */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      >
        <div className="flex items-end justify-between mb-12 px-2">
          <h2 className="text-xl font-light tracking-widest text-white/40 uppercase">Latest Posts</h2>
          <div className="text-[10px] font-mono text-white/20">{latestPosts.length} articles</div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {latestPosts.map((post) => (
            <motion.div
              key={post.id}
              className="group"
              variants={itemVariants}
              whileHover={{ 
                y: -2,
                transition: { duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }
              }}
            >
              <motion.div
                className="rounded-2xl transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.01 }}
                style={{
                  willChange: 'transform',
                  backfaceVisibility: 'hidden'
                }}
              >
                <BlogCard post={post} onClick={() => onSelectPost(post)} />
              </motion.div>
              <div className="mt-4 flex justify-between items-center opacity-40 px-1">
                <span className="text-[10px] uppercase tracking-widest">{post.date}</span>
                <span className="text-[10px] uppercase tracking-widest">{post.readingTime}</span>
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
});

Feed.displayName = 'Feed';

export default Feed;
