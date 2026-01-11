import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LikeButton from '../components/LikeButton';
import CommentSection from '../components/CommentSection';
import { notesApi } from '../services/supabaseService';
import { ICONS } from '../constants';
import type { FileNote } from '../types';

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<FileNote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/notes');
      return;
    }
    
    // 重置状态
    setNote(null);
    setError(null);
    setIsLoaded(false);
    
    loadNote();
  }, [id, navigate]);

  const loadNote = async () => {
    try {
      setError(null);
      
      const noteData = await notesApi.getById(id!);
      
      if (!noteData) {
        setError('笔记不存在');
        setIsLoaded(true);
        return;
      }
      
      // 使用与cacheService一致的数据映射
      const mappedNote: FileNote = {
        id: noteData.id,
        title: noteData.title || noteData.text?.substring(0, 50) || '无标题', // 如果没有title，使用text的前50个字符
        content: noteData.text || '', // 正确映射 text 字段到 content
        date: new Date(noteData.created_at).toLocaleDateString('zh-CN'),
        likes_count: noteData.likes_count || 0,
        created_at: noteData.created_at,
        tags: noteData.tags || []
      };
      
      setNote(mappedNote);
      setIsLoaded(true);
    } catch (err: any) {
      console.error('Failed to load note:', err);
      const errorMessage = err.message === 'PGRST116' ? '笔记不存在' : 
                          err.message || '加载失败，请稍后重试';
      setError(errorMessage);
      setIsLoaded(true);
    }
  };

  // Google Material Design 风格的渐入样式
  const fadeInStyle = {
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? 'translateY(0)' : 'translateY(8px)',
    transition: 'opacity 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)'
  };

  const staggeredFadeIn = (delay: number) => ({
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? 'translateY(0)' : 'translateY(8px)',
    transition: `opacity 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) ${delay}ms, transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) ${delay}ms`
  });

  if (error) {
    return (
      <div className="py-12" style={fadeInStyle}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass p-8 md:p-12 rounded-2xl md:rounded-[3rem] border border-red-500/20">
            <div className="text-4xl md:text-6xl mb-4 md:mb-6">😕</div>
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">出了点问题</h2>
            <p className="text-white/60 mb-6 md:mb-8 text-sm md:text-base">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setError(null);
                  setIsLoaded(false);
                  loadNote();
                }}
                className="px-4 md:px-6 py-2 md:py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm md:text-base"
              >
                重试
              </button>
              <button
                onClick={() => navigate('/notes')}
                className="px-4 md:px-6 py-2 md:py-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-sm md:text-base"
              >
                返回笔记列表
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!note && !error) {
    return (
      <div className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* 返回按钮骨架 */}
          <div className="mb-6 md:mb-8">
            <div className="w-16 md:w-20 h-4 md:h-6 bg-white/5 rounded animate-pulse" />
          </div>
          
          {/* 内容骨架 */}
          <div className="glass p-6 md:p-12 rounded-2xl md:rounded-[3rem] border border-white/5">
            {/* 引号图标骨架 */}
            <div className="w-6 md:w-8 h-6 md:h-8 bg-white/5 rounded mb-4 md:mb-8 animate-pulse" />
            
            {/* 标题骨架 */}
            <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              <div className="h-6 md:h-8 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-6 md:h-8 w-3/4 bg-white/5 rounded animate-pulse" />
            </div>
            
            {/* 内容骨架 */}
            <div className="space-y-2 md:space-y-3 mb-8 md:mb-12">
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-3/5 bg-white/5 rounded animate-pulse" />
            </div>
            
            {/* 底部信息骨架 */}
            <div className="flex items-center justify-between border-t border-white/5 pt-4 md:pt-8">
              <div className="h-3 md:h-4 w-20 md:w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-8 md:h-10 w-16 md:w-20 bg-white/5 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 - Google 风格渐入 */}
        <div style={fadeInStyle}>
          <button
            onClick={() => navigate('/notes')}
            className="mb-6 md:mb-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
            <span className="text-xs md:text-sm font-medium tracking-wider uppercase">返回</span>
          </button>
        </div>

        {/* 笔记内容 - 分层渐入 */}
        <article 
          className="glass p-6 md:p-12 rounded-2xl md:rounded-[3rem] border border-white/5 mb-8 md:mb-12 relative"
          style={staggeredFadeIn(100)}
        >
          {/* 引号图标 */}
          <div className="mb-4 md:mb-8 scale-75 md:scale-100 origin-top-left">{ICONS.QUOTES}</div>
          
          {/* 笔记标题 */}
          <h1 
            className="text-2xl md:text-4xl font-bold tracking-tight text-white/95 mb-4 md:mb-8"
            style={staggeredFadeIn(150)}
          >
            {note.title}
          </h1>
          
          {/* 笔记内容 */}
          <div 
            className="prose prose-invert prose-sm md:prose-lg max-w-none"
            style={staggeredFadeIn(200)}
          >
            <div className="text-sm md:text-lg font-light leading-relaxed text-white/80 whitespace-pre-wrap">
              {note.content}
            </div>
          </div>

          {/* 底部信息 */}
          <div 
            className="flex items-center justify-between border-t border-white/5 pt-4 md:pt-8 mt-8 md:mt-12"
            style={staggeredFadeIn(250)}
          >
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
              initialCount={(note as any).likes_count || 0}
              className="scale-90 md:scale-110"
            />
          </div>
        </article>

        {/* 评论区域 - 最后渐入 */}
        <div style={staggeredFadeIn(300)}>
          <CommentSection targetId={note.id} targetType="note" />
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;