import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState, type FC } from 'react';
import LikeButton from '../components/LikeButton';
import CommentSection from '../components/CommentSection';
import { notesApi } from '../services/supabaseService';
import { ICONS } from '../constants';
import type { FileNote } from '../types';

// unified page transition for notes
const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } }
};

const NoteDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<FileNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/notes');
      return;
    }

    let cancelled = false;
    let timer: number | null = null;

    const minSkeletonMs = window.innerWidth < 768 ? 220 : 120;
    const start = performance.now();

    const loadNote = async () => {
      try {
        setLoading(true);
        setError(null);

        const noteData = await notesApi.getById(id);

        if (!noteData) {
          setError('笔记不存在');
          return;
        }

        setNote({
          ...noteData,
          date: new Date(noteData.created_at).toLocaleDateString('zh-CN'),
          content: noteData.text || noteData.content
        });
      } catch (err: any) {
        setError(err.message || '加载失败');
      } finally {
        if (cancelled) return;

        const elapsed = performance.now() - start;
        const remaining = Math.max(0, minSkeletonMs - elapsed);

        if (remaining === 0) {
          setLoading(false);
        } else {
          timer = window.setTimeout(() => {
            if (!cancelled) setLoading(false);
          }, remaining);
        }
      }
    };

    loadNote();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-4xl mx-auto">
          {/* 返回按钮骨架 - 保持布局稳定 */}
          <div className="mb-6 md:mb-8">
            <div className="w-20 h-8 bg-white/5 rounded animate-pulse" />
          </div>

          {/* 内容骨架 - 与实际内容布局完全一致 */}
          <div className="glass p-6 md:p-12 rounded-2xl md:rounded-[3rem] border border-white/5 animate-pulse">
            <div className="w-8 h-8 bg-white/5 rounded mb-4 md:mb-8" />
            <div className="space-y-4 mb-4 md:mb-8">
              <div className="h-8 md:h-12 w-full bg-white/5 rounded" />
              <div className="h-8 md:h-12 w-3/4 bg-white/5 rounded" />
            </div>
            <div className="space-y-3 mb-8 md:mb-12">
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-2/3 bg-white/5 rounded" />
            </div>
            <div className="flex justify-between border-t border-white/5 pt-4 md:pt-8">
              <div className="h-4 w-32 bg-white/5 rounded" />
              <div className="h-8 w-16 bg-white/5 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass p-12 rounded-[3rem] border border-red-500/20">
            <div className="text-6xl mb-6">😕</div>
            <h2 className="text-2xl font-bold mb-4">出了点问题</h2>
            <p className="text-white/60 mb-8">{error || '笔记不存在'}</p>
            <button onClick={() => navigate('/notes')} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">返回笔记列表</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" exit="exit" variants={pageVariants} className="py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <button onClick={() => navigate('/notes')} className="mb-6 md:mb-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors group">
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
          <span className="text-xs md:text-sm font-medium tracking-wider uppercase">返回</span>
        </button>

        <article className="glass p-6 md:p-12 rounded-2xl md:rounded-[3rem] border border-white/5 mb-8 md:mb-12">
          <div className="mb-4 md:mb-8 scale-75 md:scale-100 origin-top-left">{ICONS.QUOTES}</div>

          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white/95 mb-4 md:mb-8">{note?.title}</h1>

          <div className="prose prose-invert prose-sm md:prose-lg max-w-none">
            <div className="text-sm md:text-lg font-light leading-relaxed text-white/80 whitespace-pre-wrap">{note?.content}</div>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-4 md:pt-8 mt-8 md:mt-12">
            <div className="flex flex-col gap-1 md:gap-2">
              <time className="text-[10px] md:text-sm font-bold tracking-widest text-white/40 uppercase">{note?.date}</time>
              {note?.tags && note.tags.length > 0 && (
                <div className="hidden md:flex gap-2 mt-2">{note.tags.map((tag, idx) => (<span key={idx} className="text-xs px-3 py-1 bg-white/10 rounded-full text-white/50">{tag}</span>))}</div>
              )}
            </div>
            <LikeButton targetType="note" targetId={note?.id ?? ''} initialCount={note?.likes_count || 0} className="scale-90 md:scale-110" />
          </div>
        </article>

        <div><CommentSection targetId={note?.id ?? ''} targetType="note" /></div>
      </div>
    </motion.div>
  );
};

export default NoteDetail;
