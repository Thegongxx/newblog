import React, { useMemo, memo } from 'react';
import { motion, Variants } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
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
        tags: ['AURA']
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
          <title>Aura · Digital Sanctuary</title>
          <meta name="description" content="一个安静的角落，记录技术与情绪的折射。" />
        </Helmet>
        <div className="space-y-12 pb-20">
          {/* 沉浸式头部 - 更大的字号与纯净的留白 */}
          <section className="pt-12 pb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <p className="text-[10px] text-white/30 tracking-[0.3em] uppercase font-bold">
                  Aura Sanctuary
                </p>
              </div>
              <h1 className="text-[42px] font-bold tracking-tight leading-[1.1] text-white italic">
                探索技术与
                <br />
                <span className="text-white/20 not-italic">情绪的折射。</span>
              </h1>
              <p className="text-[14px] text-white/40 font-light max-w-[280px] leading-relaxed">
                {isNight
                  ? '夜深了。这里的文字陪你一起醒着，直到晨光初现。'
                  : '剔除冗余。在这里，滑动是一种律动，阅读是一种呼吸。'}
              </p>
            </motion.div>
          </section>

          {/* 推荐卡片或最新文章列表 */}
          <section className="space-y-8">
            <div className="flex items-end justify-between px-1">
              <h2 className="text-[11px] font-black text-white/20 tracking-[0.2em] uppercase">Latest Reflections</h2>
              <div className="w-12 h-[1px] bg-white/5 mb-1.5" />
            </div>

            <div className="space-y-6">
              {loading && [1, 2, 3].map(i => (
                <div key={i} className="h-48 rounded-[2rem] bg-white/[0.02] border border-white/5 animate-pulse" />
              ))}

              {!loading && latestPosts.length === 0 && (
                <div className="px-6 py-12 rounded-[2rem] border border-dashed border-white/10 text-center text-white/30 text-xs italic">
                  等待第一个故事的开启...
                </div>
              )}

              {latestPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative"
                  onClick={() => onSelectPost(post)}
                >
                  <motion.div
                    whileTap={{ scale: 0.96 }}
                    className="relative overflow-hidden bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-[2.5rem] p-7 transition-colors active:bg-white/[0.06] active:border-white/10"
                  >
                    {/* 背景微光 */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] rounded-full -mr-10 -mt-10" />

                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] px-3 py-1 rounded-full bg-white/5 text-white/40 font-bold tracking-wider uppercase">
                          {post.category}
                        </span>
                        <span className="text-[10px] text-white/20 font-mono italic">
                          {post.date}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white/90 leading-snug line-clamp-2 pr-4">
                        {post.title}
                      </h3>

                      <p className="text-[13px] text-white/50 leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-[10px] text-white/30 tracking-wide">
                            {post.readingTime}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-active:translate-x-1 transition-transform">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
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
              </div>
            </div>
          </div>

          <div className="flex-[1.2] w-full flex justify-center items-center relative min-h-[400px]">
            <div className="absolute inset-0 bg-white/[0.02] blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

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
