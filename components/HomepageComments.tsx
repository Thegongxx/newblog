import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseService';
import LikeButton from './LikeButton';
import type { Comment } from '../types';
import { useIsMobile } from '../hooks/useResponsive';

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
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const isMobile = useIsMobile();

    // 加载主页评论
    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('homepage_comments')
                .select('*')
                .eq('approved', true)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setComments(data || []);
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

            const { data, error } = await supabase
                .from('homepage_comments')
                .insert([{
                    author: formData.author.trim(),
                    email: formData.email.trim() || 'anonymous@example.com',
                    content: formData.content.trim(),
                    parent_id: formData.parent_id || null, // Attempt to send parent_id
                    approved: true
                }])
                .select()
                .single();

            if (error) throw error;

            setFormData({ author: '', email: '', content: '', parent_id: '' });
            setReplyingTo(null);
            setShowForm(false);
            await loadComments();
            alert('评论已提交！');
        } catch (error) {
            console.error('Failed to submit comment:', error);
            alert('评论提交失败');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = (commentId: string, authorName: string) => {
        setReplyingTo(authorName);
        setFormData({ ...formData, parent_id: commentId });
        setShowForm(true);
    };

    const renderComment = (comment: Comment, depth = 0) => {
        const replies = comments.filter(c => c.parent_id === comment.id);
        const isNested = depth > 0;

        return (
            <motion.div
                key={comment.id}
                className={`group w-full ${isNested ? 'mt-4' : 'mb-8'}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
                <div className={`
                    relative 
                    ${isNested ? 'bg-white/[0.03] border border-white/5 rounded-2xl p-4' : ''}
                    transition-colors duration-300
                `}>
                    <div className="flex gap-4">
                        <motion.div
                            className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-[10px] font-black text-white/60"
                            whileHover={{
                                backgroundColor: "rgba(255, 255, 255, 0.15)",
                                borderColor: "rgba(255, 255, 255, 0.2)",
                            }}
                        >
                            {comment.author[0].toUpperCase()}
                        </motion.div>

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

                            <div className={`flex items-center gap-6 transition-opacity duration-300 ${isMobile ? 'opacity-100 mt-2' : 'opacity-0 group-hover:opacity-100'}`}>
                                <LikeButton
                                    targetType="homepage_comment"
                                    targetId={comment.id}
                                    className="!bg-transparent !p-0 !border-none !h-auto text-white/30 hover:text-white/60 transition-all duration-300"
                                />
                                <button
                                    onClick={() => handleReply(comment.id, comment.author)}
                                    className="text-[10px] font-bold text-white/30 hover:text-white uppercase tracking-widest transition-colors duration-300"
                                >
                                    Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {replies.length > 0 && (
                    <motion.div
                        className={`
                            ${isNested ? 'ml-0 border-l border-white/10 mt-3 pl-3' : 'ml-4 pl-4 border-l border-white/5 mt-4'}
                        `}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        {replies.map((reply, index) => (
                            <motion.div
                                key={reply.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.4 }}
                            >
                                {renderComment(reply, depth + 1)}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </motion.div>
        );
    };

    const topLevelComments = comments.filter(c => !c.parent_id);

    return (
        <motion.section
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto"
        >
            <div className="flex items-center justify-between mb-12">
                <h3 className="text-xl font-black text-white tracking-tight uppercase">
                    Guest Book <span className="text-white/20 ml-2">{comments.length}</span>
                </h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all duration-300 hover:bg-white/25 hover:border-white/30"
                >
                    {showForm ? '取消' : '写留言'}
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        className="mb-12 p-8 border border-white/5 rounded-3xl bg-white/[0.01]"
                        initial={{ opacity: 0, height: 0, x: 30 }}
                        animate={{ opacity: 1, height: 'auto', x: 0 }}
                        exit={{ opacity: 0, height: 0, x: 30 }}
                    >
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
                                    className="w-full px-0 py-2 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-all duration-300"
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Email (Private)"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-0 py-2 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-all duration-300"
                                />
                            </div>
                            <textarea
                                placeholder="Share your thoughts..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={3}
                                className="w-full px-0 py-2 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-all duration-300 resize-none"
                                required
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Post Message'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading && comments.length === 0 ? (
                <div className="text-center text-white/40 py-12">加载中...</div>
            ) : topLevelComments.length === 0 ? (
                <div className="text-center text-white/40 py-12">
                    还没有留言，来抢沙发吧！
                </div>
            ) : (
                <div>
                    {topLevelComments.map((comment, index) => (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                            {renderComment(comment)}
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.section>
    );
}