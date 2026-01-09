import React, { useEffect } from 'react';
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

    // 智能返回逻辑
    const handleBackToList = () => {
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
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <button onClick={handleBackToList} className="group flex items-center gap-2 text-white/40 hover:text-white transition-all mb-12 px-5 py-2 rounded-full glass active:scale-95">
                <div className="rotate-180 group-hover:-translate-x-1 transition-transform">{ICONS.CHEVRON_RIGHT}</div>
                <span className="text-sm font-medium">返回列表</span>
            </button>

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
    );
};

export default PostDetail;
