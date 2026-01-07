
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
        const marginLeft = depth > 0 ? `${depth * 1.5}rem` : '0';

        return (
            <div key={comment.id} style={{ marginLeft }} className="group mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex gap-4">
                    {/* Avatar Logo */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/40 group-hover:bg-white/10 transition-colors">
                        {comment.author[0].toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-white text-sm tracking-tight">{comment.author}</span>
                                <span className="text-white/20 text-[10px] font-medium">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <LikeButton
                                    targetType="homepage_comment"
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

                        <p className="text-white/70 text-base font-light leading-relaxed mb-4 whitespace-pre-wrap">
                            {comment.content}
                        </p>
                    </div>
                </div>

                {/* Replies */}
                {replies.length > 0 && (
                    <div className="mt-8 border-l border-white/5 ml-4">
                        {replies.map(reply => renderComment(reply, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    const topLevelComments = comments.filter(c => !c.parent_id);

    return (
        <div className="mt-40 pt-20 border-t border-white/5 max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tight mb-2 uppercase">Guestbook.</h2>
                    <p className="text-sm text-white/30 font-medium">Leave a trace in this digital void.</p>
                </div>

                <div className="flex items-center gap-6">
                    <LikeButton targetType="homepage" targetId="main" className="h-10 !bg-transparent !border-white/10" />
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            if (showForm) setReplyingTo(null);
                        }}
                        className="h-10 px-8 bg-white text-black font-black rounded-full hover:scale-105 active:scale-95 transition-all text-[10px] uppercase tracking-widest shadow-lg"
                    >
                        {showForm ? 'Cancel' : 'Sign'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div id="guestbook-form" className="mb-20 p-8 border border-white/5 rounded-3xl bg-white/[0.01] animate-in fade-in slide-in-from-top-4 duration-500">
                    {replyingTo && (
                        <div className="mb-8 flex items-center justify-between px-4 py-2 bg-white/5 rounded-xl">
                            <span className="text-xs text-white/40 font-medium">Writing to <span className="text-white font-bold">@{replyingTo.name}</span></span>
                            <button onClick={() => setReplyingTo(null)} className="text-[10px] uppercase tracking-widest text-rose-500/60 hover:text-rose-500 font-black">Cancel</button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <input
                                type="text"
                                value={formData.author}
                                onChange={e => setFormData({ ...formData, author: e.target.value })}
                                className="bg-transparent border-b border-white/10 px-0 py-2 text-white outline-none focus:border-white/40 transition-all text-sm"
                                placeholder="Signature *"
                                required
                            />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="bg-transparent border-b border-white/10 px-0 py-2 text-white outline-none focus:border-white/40 transition-all text-sm font-light"
                                placeholder="Email (Private)"
                            />
                        </div>
                        <textarea
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            className="w-full min-h-[100px] bg-transparent border-b border-white/10 px-0 py-2 text-white outline-none focus:border-white/40 transition-all resize-none text-sm"
                            placeholder="Your message..."
                            required
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-10 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl"
                            >
                                {loading ? 'Sending...' : (replyingTo ? 'Reply' : 'Sign Guestbook')}
                            </button>
                        </div>
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
