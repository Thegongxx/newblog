import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LikeButton from '../components/LikeButton';
import CommentSection from '../components/CommentSection';
import { notesApi } from '../services/supabaseService';
import { ICONS } from '../constants';
import type { FileNote } from '../types';

const NoteDetail: React.FC = () => {
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
    loadNote();
  }, [id, navigate]);

  const loadNote = async () => {
    try {
      setLoading(true);
      
      // 从数据库读取note
      const noteData = await notesApi.getById(id!);
      
      if (!noteData) {
        setError('笔记不存在');
        return;
      }
      
      // 格式化数据
      setNote({
        ...noteData,
        date: new Date(noteData.created_at).toLocaleDateString('zh-CN'),
        content: noteData.text || noteData.content
      });
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-4xl mx-auto">
          {/* 返回按钮骨架 */}
          <div className="mb-8">
            <div className="w-20 h-8 bg-white/5 rounded animate-pulse" />
          </div>
          
          {/* 内容骨架 */}
          <div className="glass p-12 rounded-[3rem] border border-white/5 animate-pulse">
            <div className="w-8 h-8 bg-white/5 rounded mb-8" />
            <div className="space-y-4 mb-12">
              <div className="h-6 w-full bg-white/5 rounded" />
              <div className="h-6 w-full bg-white/5 rounded" />
              <div className="h-6 w-3/4 bg-white/5 rounded" />
            </div>
            <div className="flex justify-between border-t border-white/5 pt-8">
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
            <button
              onClick={() => navigate('/notes')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              返回笔记列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="py-8 md:py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 - 移动端简化 */}
        <motion.button
          onClick={() => navigate('/notes')}
          className="mb-6 md:mb-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
          whileHover={{ x: -4 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
          <span className="text-xs md:text-sm font-medium tracking-wider uppercase">返回</span>
        </motion.button>

        {/* 笔记内容 - 移动端简化 */}
        <motion.article 
          className="glass p-6 md:p-12 rounded-2xl md:rounded-[3rem] border border-white/5 mb-8 md:mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* 引号图标 */}
          <div className="mb-4 md:mb-8 scale-75 md:scale-100 origin-top-left">{ICONS.QUOTES}</div>
          
          {/* 笔记标题 */}
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white/95 mb-4 md:mb-8">
            {note.title}
          </h1>
          
          {/* 笔记内容 */}
          <div className="prose prose-invert prose-sm md:prose-lg max-w-none">
            <div className="text-sm md:text-lg font-light leading-relaxed text-white/80 whitespace-pre-wrap">
              {note.content}
            </div>
          </div>

          {/* 底部信息 - 移动端简化 */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4 md:pt-8 mt-8 md:mt-12">
            <div className="flex flex-col gap-1 md:gap-2">
              <time className="text-[10px] md:text-sm font-bold tracking-widest text-white/40 uppercase">
                {note.date}
              </time>
              {note.tags && note.tags.length > 0 && (
                <div className="hidden md:flex gap-2 mt-2">
                  {note.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs px-3 py-1 bg-white/10 rounded-full text-white/50">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <LikeButton 
              targetType="note" 
              targetId={note.id} 
              initialCount={note.likes_count || 0}
              className="scale-90 md:scale-110"
            />
          </div>
        </motion.article>

        {/* 评论区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <CommentSection targetId={note.id} targetType="note" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NoteDetail;