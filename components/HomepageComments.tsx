
import React, { useState, useEffect } from 'react';
import { engagementApi } from '../services/supabaseService';
import LikeButton from './LikeButton';
import type { Comment } from '../types';

export default function HomepageComments() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        author: '',
        email: '',
        content: '',
        parent_id: ''
    });

    const [replyingTo, setReplyingTo] = useState<{ id: string, name: string } | null>(null);

    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await engagementApi.getHomepageComments();
            setComments(data);
        } catch (error) {
            console.error('Failed to load homepage comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.author || !formData.content) {
            alert('请填写姓名和内容哦 🌿');
            return;
        }

        try {
            setLoading(true);
            await engagementApi.createHomepageComment({
                author: formData.author,
                email: formData.email,
                content: formData.content,
                parent_id: replyingTo?.id || undefined
            });
            setFormData({ author: '', email: '', content: '', parent_id: '' });
            setReplyingTo(null);
            setShowForm(false);
            await loadComments();
        } catch (error) {
            console.error('Failed to submit comment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = (commentId: string, authorName: string) => {
        setReplyingTo({ id: commentId, name: authorName });
        setShowForm(true);
        // 滚动到表单（可选）
        window.scrollTo({ top: document.getElementById('guestbook-form')?.offsetTop ? (document.getElementById('guestbook-form')!.offsetTop - 100) : undefined, behavior: 'smooth' });
    };

    const renderComment = (comment: Comment, depth = 0) => {
        const replies = comments.filter(c => c.parent_id === comment.id);
        const marginLeft = depth > 0 ? `${depth * 2}rem` : '0';

        return (
            <div key={comment.id} style={{ marginLeft }} className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="glass p-8 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-xs font-black text-white/30 uppercase">
                                {comment.author[0]}
                            </div>
                            <div>
                                <span className="block font-bold text-white tracking-tight">{comment.author}</span>
                                <span className="block text-[10px] uppercase tracking-widest text-white/20">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <LikeButton
                                targetType="homepage_comment"
                                targetId={comment.id}
                                className="h-8 !px-3 !py-1 text-[10px]"
                            />
                            <button
                                onClick={() => handleReply(comment.id, comment.author)}
                                className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors font-bold"
                            >
                                回复
                            </button>
                        </div>
                    </div>
                    <p className="text-lg text-white/60 font-light leading-relaxed">{comment.content}</p>
                </div>
                {replies.length > 0 && (
                    <div className="mt-4 space-y-4">
                        {replies.map(reply => renderComment(reply, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    const topLevelComments = comments.filter(c => !c.parent_id);

    return (
        <div className="mt-40 pt-20 border-t border-white/5 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">主页留言.</h2>
                    <p className="text-lg text-white/30 font-light">留下你对这个空间的印记。</p>
                </div>

                <div className="flex items-center gap-4">
                    <LikeButton targetType="homepage" targetId="main" className="h-12" />
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            if (showForm) setReplyingTo(null);
                        }}
                        className="h-12 px-8 bg-white text-black font-bold rounded-full hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
                    >
                        {showForm ? '取消' : '写留言'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div id="guestbook-form" className="mb-20 glass p-10 rounded-[2.5rem] animate-in fade-in slide-in-from-top-4 duration-500">
                    {replyingTo && (
                        <div className="mb-6 flex items-center justify-between px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-sm text-white/40">正在回复 <span className="text-white font-bold">{replyingTo.name}</span></span>
                            <button onClick={() => setReplyingTo(null)} className="text-[10px] uppercase tracking-widest text-rose-500/60 hover:text-rose-500 font-black">取消回复</button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold ml-4">你的称呼</label>
                                <input
                                    type="text"
                                    value={formData.author}
                                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                                    className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-white outline-none focus:border-white/20 transition-all"
                                    placeholder="Guest"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold ml-4">你的邮箱 (可选)</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-white outline-none focus:border-white/20 transition-all font-light"
                                    placeholder="your@email.com (optional)"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold ml-4">留言内容</label>
                            <textarea
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                className="w-full min-h-[160px] bg-white/5 border border-white/5 rounded-[2rem] p-6 text-white outline-none focus:border-white/20 transition-all resize-none"
                                placeholder="Say something nice..."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all active:scale-[0.98] uppercase tracking-[0.3em] text-xs"
                        >
                            {loading ? '发送中...' : (replyingTo ? '发表回复' : '提交留言')}
                        </button>
                    </form>
                </div>
            )}

            <div className="space-y-8">
                {loading && comments.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-white/20 italic font-light tracking-widest">LOADING...</div>
                ) : topLevelComments.length === 0 ? (
                    <div className="h-40 flex items-center justify-center border border-dashed border-white/10 rounded-[2.5rem] text-white/20 italic font-light tracking-widest">还没有留言。</div>
                ) : (
                    topLevelComments.map((comment) => renderComment(comment))
                )}
            </div>
        </div>
    );
}
