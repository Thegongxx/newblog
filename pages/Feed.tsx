import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BlogCard from '../components/BlogCard';
import HomepageComments from '../components/HomepageComments';
import { Post } from '../types';
import { NOTES_DATA, ICONS, Note } from '../constants';

interface FeedProps {
  posts: Post[];
  loading: boolean;
  onSelectPost: (post: Post) => void;
}

// 模拟的随机位置和旋转角度，确保每次渲染相对固定 (Simple deterministic randomness based on index)
const getRandomStyle = (index: number) => {
  const rotations = ['rotate-[-2deg]', 'rotate-[3deg]', 'rotate-[-1deg]'];
  const translations = ['translate-x-[-10px]', 'translate-x-[15px]', 'translate-y-[10px]'];
  return `${rotations[index % 3]} ${translations[index % 3]}`;
};

const NoteModal = ({ note, onClose }: { note: Note; onClose: () => void }) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<{ text: string; date: string }[]>([
    { text: "Very inspiring!", date: "2024.03.20" }
  ]);

  const handleAddComment = () => {
    if (!comment.trim()) return;
    setComments([{ text: comment, date: new Date().toLocaleDateString() }, ...comments]);
    setComment('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        <div className="p-8 md:p-12 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Note Content */}
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {note.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold tracking-widest text-white/60 uppercase">
                  #{tag}
                </span>
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">{note.title}</h2>
            <div className="w-12 h-[1px] bg-white/10" />
            <p className="text-lg text-white/80 leading-relaxed font-light whitespace-pre-line">
              {note.content}
            </p>
            <p className="text-xs font-mono text-white/30 pt-4">— {note.date}</p>
          </div>

          {/* Local Comments Section */}
          <div className="pt-8 border-t border-white/5 space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/40">Thoughts ({comments.length})</h4>

            <div className="flex gap-4">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thought..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={!comment.trim()}
                className="px-6 py-3 bg-white text-black text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Post
              </button>
            </div>

            <div className="space-y-4">
              {comments.map((c, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-white/40 font-mono">
                    {c.text[0].toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-white/80 font-light">{c.text}</p>
                    <p className="text-[10px] text-white/20">{c.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Feed: React.FC<FeedProps> = ({ posts, loading, onSelectPost }) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // 按时间排序，最新的文章在前面
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [posts]);

  // 第一篇作为 Hero 展示，其余作为 Bento 网格
  const featuredPost = sortedPosts[0] || null;
  const bentoPosts = sortedPosts.slice(1, 5); // 只取 4 篇，保持约两行

  // 取前3个Note用于展示
  const displayNotes = useMemo(() => NOTES_DATA.slice(0, 3), []);

  const fadeInReveal = {
    initial: { opacity: 0, y: 30, filter: 'blur(10px)' },
    whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as any }
  };

  return (
    <>
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

          {/* Hero 右侧：分散式 Note 推荐 (Scattered Layout) */}
          <div className="flex-[1.2] w-full min-h-[400px] relative perspective-1000">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-white/[0.02] blur-3xl rounded-full opacity-30 pointer-events-none" />

            {/* Note 散列容器 */}
            <div className="relative w-full h-full flex items-center justify-center">
              {displayNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className={`absolute p-8 max-w-[280px] cursor-pointer group hover:z-20 transition-all duration-500 ${getRandomStyle(index)}`}
                  style={{
                    left: index === 0 ? '10%' : index === 1 ? 'auto' : '15%',
                    right: index === 1 ? '10%' : 'auto',
                    top: index === 0 ? '10%' : index === 1 ? '20%' : 'auto',
                    bottom: index === 2 ? '10%' : 'auto',
                  }}
                  onClick={() => setSelectedNote(note)}
                >
                  <div className="bg-white/[0.02] hover:bg-white/[0.08] backdrop-blur-md border border-white/5 hover:border-white/20 p-6 rounded-2xl transition-all duration-300 shadow-2xl group-hover:-translate-y-2">
                    <div className="flex items-center gap-2 mb-4 opacity-50">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                      <span className="text-[10px] uppercase tracking-widest text-white/70">Note</span>
                    </div>
                    <p className="text-white/80 font-light leading-relaxed line-clamp-3 mb-4">
                      {note.content}
                    </p>
                    <div className="flex justify-between items-center border-t border-white/5 pt-4">
                      <span className="text-[10px] font-mono text-white/30">{note.date}</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
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
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
        >
          <HomepageComments />
        </motion.div>
      </div>

      {/* Note Detail Modal */}
      <AnimatePresence>
        {selectedNote && (
          <NoteModal note={selectedNote} onClose={() => setSelectedNote(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Feed;
