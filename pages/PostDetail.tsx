import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
    const [isExiting, setIsExiting] = useState(false);

    // 缓慢渐出渐入的返回动画
    const handleBackToList = () => {
        setIsExiting(true);
        
        // 第一阶段：渐出动画
        setTimeout(() => {
            // 检查是否有 state 中的来源信息
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
        }, 800); // 800ms 缓慢渐出动画时间
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
        <div className={`max-w-4xl mx-auto transition-all duration-800 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
            isExiting 
                ? 'opacity-0 translate-y-12 scale-95 blur-sm' 
                : 'opacity-100 translate-y-0 scale-100 blur-none animate-in fade-in slide-in-from-bottom-8 duration-700'
        }`}>
            {/* 缓慢渐出的返回按钮 */}
            <button 
                onClick={handleBackToList} 
                className={`group flex items-center gap-3 text-white/40 hover:text-white transition-all duration-500 mb-12 px-6 py-3 rounded-full backdrop-blur-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 active:scale-95 ${
                    isExiting ? 'opacity-0 translate-x-8 scale-90' : 'opacity-100 translate-x-0 scale-100'
                }`}
                disabled={isExiting}
            >
                <div className="rotate-180 group-hover:-translate-x-2 transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                    {ICONS.CHEVRON_RIGHT}
                </div>
                <span className="text-sm font-medium tracking-wide">返回列表</span>
                
                {/* 渐出加载指示器 */}
                {isExiting && (
                    <div className="flex items-center gap-2 ml-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                        <span className="text-xs text-white/40 animate-pulse">正在返回...</span>
                    </div>
                )}
            </button>

            {/* 文章内容区域 - 添加渐出效果 */}
            <div className={`transition-all duration-800 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                isExiting ? 'opacity-0 translate-y-8 scale-98' : 'opacity-100 translate-y-0 scale-100'
            }`}>

            <header className="mb-20">
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
            </header>

            <div className="rounded-[3rem] overflow-hidden mb-24 aspect-[16/9] glass shadow-2xl">
                <img src={post.image} className="w-full h-full object-cover" />
            </div>

            <article
                className="prose prose-invert max-w-none prose-p:text-white/60 prose-p:leading-[1.9] prose-p:text-xl prose-p:font-light prose-headings:font-bold prose-headings:tracking-tighter prose-blockquote:border-white/20 prose-blockquote:text-white/80"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* 评论区 */}
            <CommentSection targetId={post.id} targetType="post" />
            </div>
        </div>
    );
};

export default PostDetail;
