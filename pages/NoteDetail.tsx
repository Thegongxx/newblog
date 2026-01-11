import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LikeButton from '../components/LikeButton';
import CommentSection from '../components/CommentSection';
import { useNotesCache } from '../services/cacheService';
import { ICONS } from '../constants';
import type { FileNote } from '../types';

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // 使用缓存的notes数据，避免预加载冲突
  const { data: notes = [], isLoading, error: cacheError } = useNotesCache();
  
  // 从缓存中查找对应的note
  const note = useMemo(() => {
    if (!id || !notes.length) return null;
    return notes.find((n: any) => n.id === id) || null;
  }, [id, notes]);

  useEffect(() => {
    if (!id) {
      navigate('/notes');
      return;
    }
    
    // 重置错误状态
    setError(null);
    
    // 如果有缓存错误，设置错误状态
    if (cacheError) {
      setError(cacheError.message || '加载失败');
      setIsLoaded(true);
      return;
    }
    
    // 如果不在加载中，设置加载完成
    if (!isLoading) {
      if (!note && notes.length > 0) {
        setError('笔记不存在');
      }
      setIsLoaded(true);
    }
  }, [id, navigate, note, notes, isLoading, cacheError]);

  // Google Material Design 风格的动画 - 与页面切换同步 (+0.2s)
  const googleFadeIn = {
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? 'translateY(0)' : 'translateY(12px)',
    filter: isLoaded ? 'blur(0px)' : 'blur(1px)',
    transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  };

  const googleStaggeredFadeIn = (delay: number) => ({
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)',
    filter: isLoaded ? 'blur(0px)' : 'blur(2px)',
    transition: `opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms, filter 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`
  });

  // 特殊的内容渐入效果
  const contentFadeIn = (delay: number) => ({
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
    filter: isLoaded ? 'blur(0px)' : 'blur(2px)',
    transition: `opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms, transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms, filter 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`
  });

  // 加载状态：正在加载缓存数据，或者缓存加载完成但还没找到note且没有错误
  const isLoadingState = isLoading || (!isLoaded && !error);
  
  if (error) {
    return (
      <div className="py-12" style={googleFadeIn}>
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
                }}
                className="px-4 md:px-6 py-2 md:py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 text-sm md:text-base transform hover:scale-105"
              >
                重试
              </button>
              <button
                onClick={() => navigate('/notes')}
                className="px-4 md:px-6 py-2 md:py-3 bg-white/5 hover:bg-white/10 rounded-full transition-all duration-300 text-sm md:text-base transform hover:scale-105"
              >
                返回笔记列表
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingState) {
    return null; // 直接返回空，不显示加载骨架
  }

  return (
    <div className="py-8 md:py-12 relative">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 - Google 风格缓慢渐入 */}
        <div style={googleFadeIn}>
          <button
            onClick={() => navigate('/notes')}
            className="mb-6 md:mb-8 flex items-center gap-2 text-white/60 hover:text-white transition-all duration-500 group transform hover:scale-105"
          >
            <span className="transform group-hover:-translate-x-2 transition-transform duration-500">←</span>
            <span className="text-xs md:text-sm font-medium tracking-wider uppercase">返回</span>
          </button>
        </div>

        {/* 笔记内容 - 分层渐入 */}
        <article 
          className="glass p-6 md:p-12 rounded-2xl md:rounded-[3rem] border border-white/5 mb-8 md:mb-12 relative"
          style={googleStaggeredFadeIn(50)}
        >
          {/* 引号图标 - 延迟渐入 */}
          <div 
            className="mb-4 md:mb-8 scale-75 md:scale-100 origin-top-left transform transition-all duration-500"
            style={googleStaggeredFadeIn(100)}
          >
            {ICONS.QUOTES}
          </div>
          
          {/* 笔记标题 - 更长延迟 */}
          <h1 
            className="text-2xl md:text-4xl font-bold tracking-tight text-white/95 mb-4 md:mb-8 transform transition-all duration-500"
            style={googleStaggeredFadeIn(150)}
          >
            {note.title}
          </h1>
          
          {/* 笔记内容 - 最慢渐入 */}
          <div 
            className="prose prose-invert prose-sm md:prose-lg max-w-none"
            style={contentFadeIn(200)}
          >
            <div className="text-sm md:text-lg font-light leading-relaxed text-white/80 whitespace-pre-wrap">
              {note.content}
            </div>
          </div>

          {/* 底部信息 - 最后渐入 */}
          <div 
            className="flex items-center justify-between border-t border-white/5 pt-4 md:pt-8 mt-8 md:mt-12"
            style={googleStaggeredFadeIn(250)}
          >
            <div className="flex flex-col gap-1 md:gap-2">
              <time className="text-[10px] md:text-sm font-bold tracking-widest text-white/40 uppercase">
                {note.date}
              </time>
              {note.tags && note.tags.length > 0 && (
                <div className="hidden md:flex gap-2 mt-2">
                  {note.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs px-3 py-1 bg-white/10 rounded-full text-white/50 transform transition-all duration-300 hover:scale-110 hover:bg-white/20"
                      style={googleStaggeredFadeIn(300 + idx * 50)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div style={googleStaggeredFadeIn(275)}>
              <LikeButton 
                targetType="note" 
                targetId={note.id} 
                initialCount={(note as any).likes_count || 0}
                className="scale-90 md:scale-110 transform transition-all duration-300 hover:scale-125"
              />
            </div>
          </div>
        </article>

        {/* 评论区域 - 最后的渐入 */}
        <div style={contentFadeIn(350)}>
          <CommentSection targetId={note.id} targetType="note" />
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;