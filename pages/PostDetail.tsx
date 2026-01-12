import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import CommentSection from '../components/CommentSection';
import LikeButton from '../components/LikeButton';
import { ICONS } from '../constants';
import { Z_INDEX } from '../constants/zIndex';
import { engagementApi } from '../services/supabaseService';
import { Post } from '../types';
import { useIsMobile } from '../hooks/useResponsive';
import { usePageTransition } from '../hooks/usePageTransition';

interface PostDetailProps {
    posts: Post[];
    loading?: boolean;
}

const PostDetail: React.FC<PostDetailProps> = ({ posts, loading }) => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();
    const { setNavigationMethod } = usePageTransition();
    const post = posts.find(p => p.slug === slug);

    // Google Material Design 风格的返回动画
    const handleBackToList = () => {
        // 设置返回动画
        if (isMobile) {
            setNavigationMethod('slideLeft'); // 移动端从左滑入
        } else {
            setNavigationMethod('slideUp'); // 桌面端从下方滑入
        }
        
        // 优先使用来源信息进行导航
        if (location.state?.from) {
            navigate(location.state.from);
        } else {
            // 文章详情页应该返回到主页（Feed页面）
            navigate('/');
        }
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
                <h1 className="text-4xl font-bold mb-8">文章未找到</h1>
                <button onClick={() => navigate('/')} className="px-8 py-3 glass rounded-full text-sm font-bold uppercase tracking-widest">返回主页</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* 返回按钮 - 移动端优化位置 */}
            <motion.button 
                onClick={handleBackToList} 
                className={`group flex items-center gap-2 md:gap-3 text-white/40 hover:text-white transition-all duration-200 mb-8 md:mb-12 px-4 md:px-6 py-2 md:py-3 rounded-full backdrop-blur-xl bg-white/[0.02] border border-white/5 ${
                    isMobile ? 'fixed top-28 left-4' : 'relative'
                }`}
                style={isMobile ? { zIndex: Z_INDEX.BACK_BUTTON } : {}}
                whileHover={{ scale: 1.02, x: -4 }}
                whileTap={{ scale: 0.98 }}
            >
                <motion.div className="rotate-180">
                    {ICONS.CHEVRON_RIGHT}
                </motion.div>
                <span className="text-xs md:text-sm font-medium">返回</span>
            </motion.button>

            {/* 移动端为固定返回按钮留出空间 */}
            <div className={isMobile ? 'mt-20' : ''}>
                <header className="mb-12 md:mb-20">
                    <div className="flex items-center gap-2 md:gap-3 text-white/30 text-[9px] md:text-[10px] font-bold uppercase tracking-widest md:tracking-[0.3em] mb-4 md:mb-6">
                        <span>{post.date}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span>{post.category}</span>
                    </div>
                    <h1 className="text-3xl md:text-7xl font-bold tracking-tighter mb-6 md:mb-10 leading-tight">{post.title}</h1>
                    <div className="flex items-center justify-between mb-6 md:mb-10">
                        <div className="h-[2px] w-12 md:w-20 bg-white/20" />
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
                    <img src={post.image} className="w-full h-full object-cover" />
                </div>

                <article
                    className="prose prose-invert max-w-none prose-p:text-white/60 prose-p:leading-[1.8] prose-p:text-base prose-p:md:text-xl prose-p:font-light prose-headings:font-bold prose-headings:tracking-tighter prose-blockquote:border-white/20 prose-blockquote:text-white/80"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* 评论区 */}
                <div>
                    <CommentSection targetId={post.id} targetType="post" />
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
