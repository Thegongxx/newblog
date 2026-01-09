import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import CommentSection from '../components/CommentSection';
import LikeButton from '../components/LikeButton';
import { ICONS } from '../constants';
import { engagementApi } from '../services/supabaseService';
import { Post } from '../types';

interface PostDetailProps {
    posts: Post[];
    loading?: boolean;
}

const PostDetail: React.FC<PostDetailProps> = ({ posts, loading }) => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const post = posts.find(p => p.slug === slug);

    // Google Material Design 风格的返回动画
    const handleBackToList = () => {
        // 立即导航，不要退出动画
        if (location.state?.from) {
            navigate(location.state.from);
        } else {
            // 如果没有来源信息，使用浏览器历史记录
            if (window.history.length > 1) {
                navigate(-1);
            } else {
                // 最后的备选方案：返回主页
                navigate('/');
            }
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
        <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
                duration: 0.6, 
                ease: [0.4, 0.0, 0.2, 1],
                staggerChildren: 0.1
            }}
        >
            {/* Google Material Design 风格返回按钮 */}
            <motion.button 
                onClick={handleBackToList} 
                className="group flex items-center gap-3 text-white/40 hover:text-white transition-all duration-200 mb-12 px-6 py-3 rounded-full backdrop-blur-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 material-shadow-1 hover:material-shadow-2"
                whileHover={{ scale: 1.02, x: -4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <motion.div 
                    className="rotate-180 group-hover:-translate-x-1 transition-transform duration-200"
                    whileHover={{ x: -2 }}
                >
                    {ICONS.CHEVRON_RIGHT}
                </motion.div>
                <span className="text-sm font-medium tracking-wide">返回列表</span>
            </motion.button>

            <motion.header 
                className="mb-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="flex items-center gap-3 text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
                    <span>{post.date}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span>{post.category}</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-10 leading-tight">{post.title}</h1>
                <div className="flex items-center justify-between">
                    <div className="h-[2px] w-20 bg-white/20 mb-10" />
                    <div className="flex items-center gap-6 mb-10">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-1">VIEWS</span>
                            <span className="text-lg font-light text-white/40 tabular-nums">{post.views || 0}</span>
                        </div>
                        <LikeButton targetType="post" targetId={post.id} initialCount={post.likes_count} />
                    </div>
                </div>
                <p className="text-xl md:text-2xl text-white/50 leading-relaxed font-light">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
                    <span>{post.date}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span>{post.category}</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-10 leading-tight">{post.title}</h1>
                <div className="flex items-center justify-between">
                    <div className="h-[2px] w-20 bg-white/20 mb-10" />
                    <div className="flex items-center gap-6 mb-10">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-1">VIEWS</span>
                            <span className="text-lg font-light text-white/40 tabular-nums">{post.views || 0}</span>
                        </div>
                        <LikeButton targetType="post" targetId={post.id} initialCount={post.likes_count} />
                    </div>
                </div>
                <p className="text-xl md:text-2xl text-white/50 leading-relaxed font-light">{post.excerpt}</p>
            </motion.header>

            <motion.div 
                className="rounded-[3rem] overflow-hidden mb-24 aspect-[16/9] material-shadow-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
            >
                <img src={post.image} className="w-full h-full object-cover" />
            </motion.div>

            <motion.article
                className="prose prose-invert max-w-none prose-p:text-white/60 prose-p:leading-[1.9] prose-p:text-xl prose-p:font-light prose-headings:font-bold prose-headings:tracking-tighter prose-blockquote:border-white/20 prose-blockquote:text-white/80"
                dangerouslySetInnerHTML={{ __html: post.content }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            />

            {/* 评论区 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <CommentSection targetId={post.id} targetType="post" />
            </motion.div>
        </motion.div>
    );
};

export default PostDetail;
