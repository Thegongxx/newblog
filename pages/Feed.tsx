import React, { useMemo, memo } from 'react';
import { motion, Variants } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import BlogCard from '../components/BlogCard';
import HomepageComments from '../components/HomepageComments';
import LikeButton from '../components/LikeButton';
import { Post } from '../types';
import { getAllNotes } from '../utils/notes';
import { useIsMobile } from '../hooks/useResponsive';
import { useTheme } from '@/context/ThemeContext';

interface FeedProps {
  posts: Post[];
  loading: boolean;
  onSelectPost: (post: Post) => void;
}

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all duration-300 group"
      aria-label="Toggle Theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {theme === 'dark' ? (
          <svg className="w-4 h-4 text-white/60 group-hover:text-amber-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-yellow-600 group-hover:text-yellow-800 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </motion.div>
    </button>
  );
};

const Feed: React.FC<FeedProps> = memo(({ posts, loading, onSelectPost }) => {
  const isMobile = useIsMobile();

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [posts]);

  const latestPosts = useMemo(() => sortedPosts.slice(0, 4), [sortedPosts]);

  const notes = useMemo(() => {
    try {
      return getAllNotes();
    } catch (error) {
      console.warn('Failed to load notes:', error);
      return [];
    }
  }, []);

  const randomNote = useMemo(() => {
    if (notes.length === 0) {
      return {
        id: 'default',
        title: 'Welcome',
        content: 'Digital Sanctuary awaits your thoughts.',
        date: new Date().toLocaleDateString(),
        tags: ['XUAN']
      };
    }
    const index = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % notes.length;
    return notes[index];
  }, [notes]);

  if (isMobile) {
    const hour = new Date().getHours();
    const isNight = hour >= 23 || hour < 6;

    return (
      <>
        <Helmet>
          <title>Xuan · Digital Sanctuary</title>
          <meta name="description" content="一个安静的角落，记录技术与情绪的折射。" />
        </Helmet>
        <div className="space-y-12 pb-20">
          {/* 简洁头部 */}
          <section className="pt-8 pb-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-bold tracking-tight leading-tight text-white">
                在这里，
                <br />
                <span className="text-white/30">记录轩轩的生活折射。</span>
              </h1>
            </motion.div>
          </section>

          {/* 最新文章列表 - 极简 */}
          <section className="space-y-4">
            <div className="space-y-4">
              {loading && [1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
              ))}

              {!loading && latestPosts.length === 0 && (
                <div className="px-6 py-12 rounded-2xl border border-dashed border-white/10 text-center text-white/30 text-xs italic">
                  等待第一个故事的开启...
                </div>
              )}

              {latestPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  className="group"
                  onClick={() => onSelectPost(post)}
                >
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 active:bg-white/[0.04] transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-white/30 uppercase tracking-wider font-medium">
                        {post.category && <span>{post.category}</span>}
                        <span>{post.date}</span>
                      </div>

                      <h3 className="text-lg font-bold text-white/90 leading-snug">
                        {post.title}
                      </h3>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-white/30 tracking-wide uppercase">
                          {post.readingTime}
                        </span>
                        <div className="flex items-center gap-1 text-white/20">
                          <span className="text-[9px] uppercase tracking-tighter">Read</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* 实时评论部分 - 转入移动端适配样式 */}
          <section className="pt-4 px-1">
            <HomepageComments />
          </section>
        </div>
      </>
    );
  }

  const containerVariants: Variants = {
    hidden: { x: '100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "tween" as const,
        ease: [0.25, 0.1, 0.25, 1],
        duration: 0.4,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { x: 20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "tween" as const,
        ease: [0.25, 0.1, 0.25, 1],
        duration: 0.4
      }
    }
  };

  const fadeInReveal = {
    initial: { x: 20, opacity: 0 },
    whileInView: { x: 0, opacity: 1 },
    viewport: { once: true, margin: "-30px" },
    transition: {
      type: "tween" as const,
      ease: [0.25, 0.1, 0.25, 1],
      duration: 0.5
    }
  };

  return (
    <>
      <Helmet>
        <title>Aura Blog · Digital Sanctuary</title>
        <meta name="description" content="探索技术与情感之间的无形联系。记录思考、技术与生活。" />
        <meta property="og:title" content="Aura Blog" />
        <meta property="og:description" content="一个安静的角落，记录技术与情绪的折射。" />
        <meta property="og:type" content="website" />
      </Helmet>
      <motion.div
        className="space-y-16 md:space-y-64 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }}
      >
        <motion.section
          {...(fadeInReveal as any)}
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
                className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-sm" />

                <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                  Scroll to Explore
                </span>
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300 group-hover:scale-110 group-hover:rotate-90 relative z-10">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1V11M6 11L1 6M6 11L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </button>

              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                  Like This Space
                </span>
                <LikeButton
                  targetType="homepage"
                  targetId="main"
                  className="!bg-white/5 !border-white/10 hover:!bg-white/10 !px-4 !py-2"
                />

                <ThemeToggle />
              </div>
            </div>
          </div>

          <div className="flex-[1.2] w-full flex justify-center items-center relative min-h-[400px]">
            {/* <div className="absolute inset-0 bg-white/[0.02] blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-500" /> */}

            <div className="relative z-10 w-full max-w-lg flex flex-col space-y-12 group cursor-pointer hover:scale-[1.02] transition-all duration-500">
              <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <span className="w-2 h-2 bg-white/50 rounded-full group-hover:bg-white group-hover:scale-125 transition-all duration-300" />
                <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase group-hover:tracking-[0.3em] transition-all duration-300">
                  Daily Note
                </span>
              </div>

              <div className="space-y-6">
                <h3 className="text-4xl font-bold text-white tracking-tight leading-tight group-hover:text-white/90 group-hover:translate-x-2 transition-all duration-300">
                  {(randomNote as any).title || (randomNote as any).text?.substring(0, 30) + '...'}
                </h3>
                <p className="text-xl font-light text-white/70 leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                  {(randomNote as any).content || (randomNote as any).text}
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors duration-300">
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest group-hover:text-white/50 transition-colors duration-300">
                  {(randomNote as any).date || new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

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

        <motion.div variants={itemVariants}>
          <HomepageComments />
        </motion.div>
      </motion.div>
    </>
  );
});

Feed.displayName = 'Feed';

export default Feed;
