import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import CommentSection from '../components/CommentSection';
import LikeButton from '../components/LikeButton';
import { ICONS } from '../constants';
import { Z_INDEX } from '../constants/zIndex';
import { engagementApi } from '../services/supabaseService';
import { Post } from '../types';
import { useIsMobile } from '../hooks/useResponsive';
import { usePageTransition } from '../hooks/usePageTransition';
import { APPLE_EASING } from '../constants/animations';

interface PostDetailProps {
    posts: Post[];
    loading?: boolean;
}

const PostDetail: React.FC<PostDetailProps> = ({ posts, loading }) => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();
    const [readProgress, setReadProgress] = useState(0);
    const { setNavigationMethod } = usePageTransition();
    const post = posts.find(p => p.slug === slug);

    const fromPath = (location.state as any)?.from as string | undefined;

    const breadcrumbLabel = (() => {
        if (fromPath === '/archive') return 'Archive · 文章';
        if (fromPath === '/notes') return 'Notes · 文章';
        return 'Home · 文章';
    })();

    const backLabel = (() => {
        if (fromPath === '/archive') return '返回归档';
        if (fromPath === '/notes') return '返回列表';
        return '返回主页';
    })();

    // Google Material Design 风格的返回动画
    const handleBackToList = () => {
        // 设置返回动画
        if (isMobile) {
            setNavigationMethod('slideLeft'); // 移动端从左滑入
        } else {
            setNavigationMethod('slideUp'); // 桌面端从下方滑入
        }

        const target = fromPath || '/';
        navigate(target);
    };

    useEffect(() => {
        if (post) {
            const trackView = async () => {
                try {
                    await engagementApi.incrementView(post.id);
                } catch (err) {
                    console.error('Failed to track view:', err);
                }
            };
            trackView();
        }
    }, [post]);

    // 阅读进度条
    useEffect(() => {
        const handleScroll = () => {
            const doc = document.documentElement;
            const total = doc.scrollHeight - doc.clientHeight;
            if (total <= 0) {
                setReadProgress(0);
                return;
            }
            const progress = window.scrollY / total;
            setReadProgress(Math.min(Math.max(progress, 0), 1));
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 加载状态下的骨架屏 (Loading Skeleton)
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto animate-pulse">
                <div className="h-10 w-32 bg-white/5 rounded-full mb-12" />
                <div className="space-y-6 mb-20">
                    <div className="h-4 w-40 bg-white/5 rounded" />
                    <div className="h-20 w-3/4 bg-white/5 rounded" />
                    <div className="h-6 w-1/2 bg-white/5 rounded" />
                </div>
                <div className="rounded-[3rem] aspect-[16/9] bg-white/5 mb-24" />
                <div className="space-y-4">
                    <div className="h-4 w-full bg-white/5 rounded" />
                    <div className="h-4 w-full bg-white/5 rounded" />
                    <div className="h-4 w-2/3 bg-white/5 rounded" />
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-4xl mx-auto py-20 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">这篇文章暂时走失了</h1>
                <p className="text-sm md:text-base text-white/50 mb-8">
                    可能被我移动到了别的角落，或者正在重写的路上。
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 glass rounded-full text-xs md:text-sm font-bold tracking-[0.2em] uppercase"
                >
                    回到主页
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* 顶部细阅读进度条 */}
            <motion.div
                className="fixed left-0 top-0 h-[2px] bg-white/60 origin-left"
                style={{
                    width: `${readProgress * 100}%`,
                    zIndex: Z_INDEX.NAVIGATION - 1,
                    pointerEvents: 'none',
                    willChange: 'transform, width, opacity',
                    opacity: readProgress > 0.02 ? 1 : 0
                }}
                transition={{
                    ease: APPLE_EASING.ease,
                    duration: 0.2
                }}
            />
            {/* 返回按钮 - 移动端和桌面端统一布局 */}
            <motion.button
                onClick={handleBackToList}
                className="group flex items-center gap-2 md:gap-3 text-white/40 hover:text-white transition-all duration-300 mb-8 md:mb-12 px-4 md:px-6 py-2 md:py-3 rounded-full backdrop-blur-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 hover:border-white/15"
                whileHover={{
                    scale: 1.05,
                    x: -6,
                    transition: {
                        ...APPLE_EASING.spring,
                        duration: 0.2
                    }
                }}
                whileTap={{
                    scale: 0.95,
                    transition: {
                        ...APPLE_EASING.spring,
                        stiffness: 600,
                        duration: 0.1
                    }
                }}
            >
                <motion.div
                    className="rotate-180"
                    whileHover={{
                        x: -2,
                        transition: {
                            ...APPLE_EASING.spring,
                            duration: 0.2
                        }
                    }}
                >
                    {ICONS.CHEVRON_RIGHT}
                </motion.div>
                <span className="text-xs md:text-sm font-medium group-hover:tracking-wider transition-all duration-300">
                    {backLabel}
                </span>

                {/* 悬停时的光晕效果 */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    initial={{ scale: 0.8 }}
                    whileHover={{ scale: 1 }}
                    transition={{
                        ...APPLE_EASING.ease,
                        duration: 0.3
                    }}
                />
            </motion.button>

            <div>
                <header className="mb-12 md:mb-20">
                    {/* 面包屑 */}
                    <div className="mb-3 md:mb-4 text-[10px] md:text-xs text-white/30 tracking-[0.2em] uppercase">
                        {breadcrumbLabel}
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 text-white/30 text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.3em] mb-4 md:mb-6">
                        <span>{post.date}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span>{post.category}</span>
                    </div>
                    <h1 className="text-3xl md:text-7xl font-bold tracking-tighter mb-6 md:mb-10 leading-tight">{post.title}</h1>
                    <div className="flex items-center justify-between mb-6 md:mb-10">
                        <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs text-white/40">
                            <span className="h-[2px] w-10 md:w-16 bg-white/20" />
                            {post.readingTime && (
                                <span>约 {post.readingTime} · 适合一杯饮料的时间</span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/20 font-bold mb-1">VIEWS</span>
                                <span className="text-base md:text-lg font-light text-white/40 tabular-nums">{post.views || 0}</span>
                            </div>
                            <LikeButton targetType="post" targetId={post.id} initialCount={post.likes_count} />
                        </div>
                    </div>
                    <p className="text-base md:text-2xl text-white/50 leading-relaxed font-light">{post.excerpt}</p>
                </header>

                <div className="rounded-2xl md:rounded-[3rem] overflow-hidden mb-12 md:mb-24 aspect-[16/9]">
                    <img
                        src={post.image}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                    />
                </div>

                <article
                    className="prose prose-invert max-w-none prose-p:text-white/60 prose-p:leading-[1.8] prose-p:text-base prose-p:md:text-xl prose-p:font-light prose-headings:font-bold prose-headings:tracking-tighter prose-blockquote:border-white/20 prose-blockquote:text-white/80"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* 底部 CTA + 评论区 */}
                <div className="mt-12 md:mt-16 space-y-8">
                    <div className="border border-white/5 rounded-2xl md:rounded-3xl px-5 md:px-8 py-4 md:py-6 bg-white/[0.02]">
                        <p className="text-xs md:text-sm text-white/50 leading-relaxed">
                            如果这篇文字让你有一点点共鸣，
                            可以点一个 <span className="underline decoration-dotted">❤️</span>，
                            或者在下面留两行字，让这篇文章不只是一段独白。
                        </p>
                    </div>
                    <div>
                        <CommentSection targetId={post.id} targetType="post" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
