import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { commentsApi } from '../services/supabaseService';
import type { Comment } from '../types';

export default function HomepageComments() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [author, setAuthor] = useState('');
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // 使用特殊的 post_id 来标识主页评论
    const HOMEPAGE_POST_ID = 'homepage-comments';

    // 加载主页评论
    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await commentsApi.getByPostId(HOMEPAGE_POST_ID);
            setComments(data);
        } catch (error) {
            console.error('Failed to load homepage comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !author.trim()) return;

        try {
            setSubmitting(true);
            await commentsApi.create({
                post_id: HOMEPAGE_POST_ID,
                author: author.trim(),
                email: email.trim() || 'anonymous@example.com', // 提供默认邮箱
                content: newComment.trim()
            });
            
            setNewComment('');
            setAuthor('');
            setEmail('');
            await loadComments(); // 重新加载评论
        } catch (error) {
            console.error('Failed to submit comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="space-y-16"
        >
            {/* 标题区域 */}
            <div className="text-center space-y-6">
                <h2 className="text-2xl md:text-3xl font-light tracking-widest text-white/40 uppercase">
                    Guest Book
                </h2>
                <div className="w-16 h-[1px] bg-white/10 mx-auto" />
                <p className="text-white/30 text-sm max-w-md mx-auto leading-relaxed">
                    在这个数字空间里留下你的足迹，分享你的想法与感悟
                </p>
            </div>

            {/* 评论表单 */}
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="你的名字"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="px-6 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all duration-300"
                            required
                        />
                        <input
                            type="email"
                            placeholder="邮箱 (可选)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="px-6 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all duration-300"
                        />
                    </div>
                    <textarea
                        placeholder="留下你的想法..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={4}
                        className="w-full px-6 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all duration-300 resize-none"
                        required
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim() || !author.trim()}
                            className="px-8 py-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white rounded-full text-sm font-medium transition-all duration-300 disabled:cursor-not-allowed"
                        >
                            {submitting ? '发送中...' : '发送'}
                        </button>
                    </div>
                </form>
            </div>

            {/* 评论列表 */}
            <div className="max-w-3xl mx-auto space-y-8">
                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="h-4 w-24 bg-white/5 rounded mb-3" />
                                <div className="h-16 bg-white/5 rounded-2xl" />
                            </div>
                        ))}
                    </div>
                ) : comments.length > 0 ? (
                    <div className="space-y-8">
                        {comments.map((comment, index) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="group"
                            >
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.03] hover:border-white/10 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-white/80 font-medium">{comment.author}</h4>
                                        <time className="text-white/30 text-xs">
                                            {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                                        </time>
                                    </div>
                                    <p className="text-white/60 leading-relaxed whitespace-pre-wrap">
                                        {comment.content}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-white/20 text-sm">还没有留言，成为第一个留言的人吧</p>
                    </div>
                )}
            </div>
        </motion.section>
    );
}