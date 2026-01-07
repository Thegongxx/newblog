
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
        if (!formData.author || !formData.email || !formData.content) return;

        try {
            setLoading(true);
            await engagementApi.createHomepageComment({
                author: formData.author,
                email: formData.email,
                content: formData.content,
                parent_id: formData.parent_id || undefined
            });
            setFormData({ author: '', email: '', content: '', parent_id: '' });
            setShowForm(false);
            await loadComments();
        } catch (error) {
            console.error('Failed to submit comment:', error);
        } finally {
            setLoading(false);
        }
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
                        onClick={() => setShowForm(!showForm)}
                        className="h-12 px-8 bg-white text-black font-bold rounded-full hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
                    >
                        {showForm ? '取消' : '写留言'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="mb-20 glass p-10 rounded-[2.5rem] animate-in fade-in slide-in-from-top-4 duration-500">
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
                                <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold ml-4">你的邮箱</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-white outline-none focus:border-white/20 transition-all"
                                    placeholder="hello@example.com"
                                    required
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
                            {loading ? '发送中...' : '提交留言'}
                        </button>
                    </form>
                </div>
            )}

            <div className="space-y-6">
                {loading && comments.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-white/20 italic font-light tracking-widest">LOADING...</div>
                ) : topLevelComments.length === 0 ? (
                    <div className="h-40 flex items-center justify-center border border-dashed border-white/10 rounded-[2.5rem] text-white/20 italic font-light tracking-widest">还没有留言。</div>
                ) : (
                    topLevelComments.map((comment, i) => (
                        <div
                            key={comment.id}
                            className="glass p-8 rounded-[2rem] border border-white/5 animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
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
                            </div>
                            <p className="text-lg text-white/60 font-light leading-relaxed">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
