import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import LikeButton from '../components/LikeButton';
import CommentSection from '../components/CommentSection';
import { useNotesCache } from '../services/cacheService';
import { ICONS } from '../constants';
import { Z_INDEX } from '../constants/zIndex';
import { useIsMobile } from '../hooks/useResponsive';
import { usePageTransition } from '../hooks/usePageTransition';
import type { FileNote } from '../types';

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setNavigationMethod } = usePageTransition();
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

    setError(null);

    if (cacheError) {
      setError(cacheError.message || '加载失败');
      setIsLoaded(true);
      return;
    }

    if (!isLoading) {
      if (!note && notes.length > 0) {
        setError('笔记不存在');
      }
      setIsLoaded(true);
    }
  }, [id, navigate, note, notes, isLoading, cacheError]);

  const appleFadeIn = {
    opacity: isLoaded ? 1 : 0,
    x: isLoaded ? 0 : 20,
    transition: 'opacity 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), x 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)'
  };

  const appleStaggeredFadeIn = (delay: number) => ({
    opacity: isLoaded ? 1 : 0,
    x: isLoaded ? 0 : 30,
    transition: `opacity 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}ms, x 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}ms`
  });

  const contentFadeIn = (delay: number) => ({
    opacity: isLoaded ? 1 : 0,
    x: isLoaded ? 0 : 40,
    transition: `opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}ms, x 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}ms`
  });

  const isLoadingState = isLoading || (!isLoaded && !error);

  if (error) {
    return (
      <>
        <Helmet>
          <title>Error - Aura Blog</title>
        </Helmet>
        <div className="py-12" style={appleFadeIn}>
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
      </>
    );
  }

  if (isLoadingState) {
    return (
      <>
        <Helmet>
          <title>Loading Note... - Aura Blog</title>
        </Helmet>
      </>
    );
  }

  if (!note) return null;

  return (
    <>
      <Helmet>
        <title>{note.title} - Note · Aura Blog</title>
        <meta name="description" content={note.content.substring(0, 160)} />
        <meta property="og:title" content={note.title} />
        <meta property="og:description" content={note.content.substring(0, 160)} />
        <meta property="og:type" content="article" />
      </Helmet>
      <div className="py-8 md:py-12 relative">
        <div className="max-w-4xl mx-auto">
          <motion.button
            onClick={() => {
              if (isMobile) {
                setNavigationMethod('slideLeft');
              } else {
                setNavigationMethod('slideUp');
              }
              navigate('/notes');
            }}
            className="group flex items-center gap-2 text-white/60 hover:text-white transition-all duration-300 mb-6 md:mb-8 px-4 py-2 rounded-full backdrop-blur-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 hover:border-white/15"
            style={appleFadeIn}
            whileHover={{
              scale: 1.05,
              x: -6,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 25,
                duration: 0.2
              }
            }}
            whileTap={{
              scale: 0.95,
              transition: {
                type: "spring",
                stiffness: 600,
                damping: 30,
                duration: 0.1
              }
            }}
          >
            <motion.div
              className="rotate-180"
              whileHover={{
                x: -2,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  duration: 0.2
                }
              }}
            >
              {ICONS.CHEVRON_RIGHT}
            </motion.div>
            <span className="text-xs md:text-sm font-medium group-hover:tracking-wider transition-all duration-300">
              返回笔记列表
            </span>
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          <div>
            <article
              className="glass p-6 md:p-12 rounded-2xl md:rounded-[3rem] border border-white/5 mb-8 md:mb-12 relative"
              style={appleStaggeredFadeIn(50)}
            >
              <div
                className="mb-4 md:mb-8 scale-75 md:scale-100 origin-top-left transform transition-all duration-400"
                style={appleStaggeredFadeIn(100)}
              >
                {ICONS.QUOTES}
              </div>

              <h1
                className="text-2xl md:text-4xl font-bold tracking-tight text-white/95 mb-4 md:mb-8 transform transition-all duration-400"
                style={appleStaggeredFadeIn(150)}
              >
                {note.title}
              </h1>

              <div
                className="prose prose-invert prose-sm md:prose-lg max-w-none"
                style={contentFadeIn(200)}
              >
                <div className="text-sm md:text-lg font-light leading-relaxed text-white/80 whitespace-pre-wrap">
                  {note.content}
                </div>
              </div>

              <div
                className="flex items-center justify-between border-t border-white/5 pt-4 md:pt-8 mt-8 md:mt-12"
                style={appleStaggeredFadeIn(250)}
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
                          style={appleStaggeredFadeIn(300 + idx * 50)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={appleStaggeredFadeIn(275)}>
                  <LikeButton
                    targetType="note"
                    targetId={note.id}
                    initialCount={(note as any).likes_count || 0}
                    className="scale-90 md:scale-110 transform transition-all duration-300 hover:scale-125"
                  />
                </div>
              </div>
            </article>

            <div style={contentFadeIn(350)}>
              <div className="border border-white/5 rounded-2xl md:rounded-3xl px-5 md:px-8 py-4 md:py-6 bg-white/[0.02] mb-6 md:mb-8">
                <p className="text-xs md:text-sm text-white/55 leading-relaxed">
                  如果这条笔记让你哪怕想起了一点点什么，
                  也可以在下面留一个小小的脚注。
                </p>
              </div>
              <CommentSection targetId={note.id} targetType="note" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NoteDetail;