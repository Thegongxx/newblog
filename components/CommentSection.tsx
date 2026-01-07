
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
        const marginLeft = depth > 0 ? `${depth * 2}rem` : '0';

        return (
            <div key={comment.id} style={{ marginLeft }} className="mb-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="font-medium text-white">{comment.author}</span>
                            <span className="text-white/40 text-sm ml-3">
                                {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <LikeButton
                                targetType="comment"
                                targetId={comment.id}
                                className="h-8 !px-3 !py-1 text-[10px]"
                            />
                            <button
                                onClick={() => handleReply(comment.id, comment.author)}
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                回复
                            </button>
                        </div>
                    </div>
                    <p className="text-white/70 leading-relaxed">{comment.content}</p>
                </div>

                {/* 渲染回复 */}
                {replies.length > 0 && (
                    <div className="mt-4">
                        {replies.map(reply => renderComment(reply, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    const topLevelComments = comments.filter(c => !c.parent_id);

    return (
        <div className="mt-16 pt-12 border-t border-white/10">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">
                    评论 ({comments.length})
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
                <div className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    {replyingTo && (
                        <div className="mb-4 text-sm text-white/60">
                            回复 <span className="text-blue-400">{replyingTo}</span>
                            <button
                                onClick={() => {
                                    setReplyingTo(null);
                                    setFormData({ ...formData, parent_id: '' });
                                }}
                                className="ml-2 text-red-400 hover:text-red-300"
                            >
                                取消回复
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="昵称 *"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
                                required
                            />
                            <input
                                type="email"
                                placeholder="邮箱（可选，不会公开）"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
                            />
                        </div>
                        <textarea
                            placeholder="写下你的想法... *"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors resize-none"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '提交中...' : '发表评论'}
                        </button>
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
