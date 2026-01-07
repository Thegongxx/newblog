
import React, { useState } from 'react';
import { commentsApi } from '../services/supabaseService';
import LikeButton from './LikeButton';
import type { Comment } from '../types';

interface CommentSectionProps {
    postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        author: '',
        email: '',
        content: '',
        parent_id: ''
    });
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    // 加载评论
    React.useEffect(() => {
        loadComments();
    }, [postId]);

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await commentsApi.getByPostId(postId);
            setComments(data);
        } catch (error) {
            console.error('Failed to load comments:', error);
        } finally {
            setLoading(false);
        }
    };

    // 提交评论
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.author || !formData.content) {
            alert('请填写姓名和内容哦 🌿');
            return;
        }

        try {
            setLoading(true);
            await commentsApi.create({
                post_id: postId,
                author: formData.author,
                email: formData.email,
                content: formData.content,
                parent_id: formData.parent_id || undefined
            });

            // 重置表单
            setFormData({ author: '', email: '', content: '', parent_id: '' });
            setReplyingTo(null);
            setShowForm(false);

            // 重新加载评论
            await loadComments();
            alert('评论已提交！');
        } catch (error) {
            console.error('Failed to submit comment:', error);
            alert('评论提交失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    // 回复评论
    const handleReply = (commentId: string, authorName: string) => {
        setReplyingTo(authorName);
        setFormData({ ...formData, parent_id: commentId });
        setShowForm(true);
    };

    // 渲染嵌套评论
    const renderComment = (comment: Comment, depth = 0) => {
        const replies = comments.filter(c => c.parent_id === comment.id);
        const marginLeft = depth > 0 ? `${depth * 1.5}rem` : '0';

        return (
            <div key={comment.id} style={{ marginLeft }} className="group mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex gap-4">
                    {/* Notion 风格头像 */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-[10px] font-black text-white/60 group-hover:bg-white/10 transition-colors">
                        {comment.author[0].toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-white text-sm tracking-tight">{comment.author}</span>
                            <span className="text-white/20 text-[10px] font-medium">
                                {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        <p className="text-white/70 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                            {comment.content}
                        </p>

                        <div className="flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <LikeButton
                                targetType="comment"
                                targetId={comment.id}
                                className="!bg-transparent !p-0 !border-none !h-auto text-white/30 hover:text-white/60 transition-colors"
                            />
                            <button
                                onClick={() => handleReply(comment.id, comment.author)}
                                className="text-[10px] font-bold text-white/30 hover:text-white uppercase tracking-widest transition-colors"
                            >
                                Reply
                            </button>
                        </div>
                    </div>
                </div>

                {/* 渲染回复 */}
                {replies.length > 0 && (
                    <div className="mt-6 border-l border-white/5 ml-4">
                        {replies.map(reply => renderComment(reply, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    const topLevelComments = comments.filter(c => !c.parent_id);

    return (
        <div className="mt-24 max-w-2xl">
            <div className="flex items-center justify-between mb-12">
                <h3 className="text-xl font-black text-white tracking-tight uppercase">
                    Discussion <span className="text-white/20 ml-2">{comments.length}</span>
                </h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all"
                >
                    {showForm ? '取消' : '写评论'}
                </button>
            </div>

            {/* 评论表单 */}
            {showForm && (
                <div className="mb-12 p-8 border border-white/5 rounded-3xl bg-white/[0.01]">
                    {replyingTo && (
                        <div className="mb-6 text-xs text-white/40 flex items-center justify-between">
                            <span>Replying to <span className="text-white font-bold">@{replyingTo}</span></span>
                            <button
                                onClick={() => {
                                    setReplyingTo(null);
                                    setFormData({ ...formData, parent_id: '' });
                                }}
                                className="text-red-400/60 hover:text-red-400"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Name *"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="px-0 py-2 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email (Private)"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="px-0 py-2 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors"
                            />
                        </div>
                        <textarea
                            placeholder="Share your thoughts..."
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={3}
                            className="w-full px-0 py-2 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors resize-none"
                            required
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Post Comment'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 评论列表 */}
            {loading && comments.length === 0 ? (
                <div className="text-center text-white/40 py-12">加载中...</div>
            ) : topLevelComments.length === 0 ? (
                <div className="text-center text-white/40 py-12">
                    还没有评论，来抢沙发吧！
                </div>
            ) : (
                <div>
                    {topLevelComments.map(comment => renderComment(comment))}
                </div>
            )}
        </div>
    );
}
