import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseService';
import LikeButton from './LikeButton';
import type { Comment } from '../types';

export default function HomepageComments() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        author: '',
        email: '',
        content: ''
    });

    // 加载主页评论 - 直接查询 comments 表
    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        try {
            setLoading(true);
            console.log('Loading homepage comments...');
            
            // 使用独立的 homepage_comments 表
            const { data, error } = await supabase
                .from('homepage_comments')
                .select('*')
                .eq('approved', true)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            
            console.log('Homepage comments loaded:', data);
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
            console.log('Submitting homepage comment...');

            // 插入到独立的 homepage_comments 表
            const { data, error } = await supabase
                .from('homepage_comments')
                .insert([{
                    author: formData.author.trim(),
                    email: formData.email.trim() || 'anonymous@example.com',
                    content: formData.content.trim(),
                    approved: true
                }])
                .select()
                .single();

            if (error) {
                console.error('Supabase insert error:', error);
                throw error;
            }
            
            console.log('Homepage comment created successfully:', data);
            
            // 重置表单
            setFormData({ author: '', email: '', content: '' });
            setShowForm(false);
            await loadComments(); // 重新加载评论
            alert('评论已提交！');
        } catch (error) {
            console.error('Failed to submit homepage comment:', error);
            
            // 更详细的错误信息
            if (error instanceof Error) {
                alert(`评论提交失败: ${error.message}`);
            } else {
                alert('评论提交失败，请检查网络连接或稍后重试');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="max-w-2xl mx-auto"
        >
            {/* 标题区域 - 与其他评论区保持一致 */}
            <div className="flex items-center justify-between mb-12">
                <h3 className="text-xl font-black text-white tracking-tight uppercase">
                    Guest Book <span className="text-white/20 ml-2">{comments.length}</span>
                </h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all"
                >
                    {showForm ? '取消' : '写留言'}
                </button>
            </div>

            {/* 评论表单 - 与其他评论区保持一致的样式 */}
            {showForm && (
                <div className="mb-12 p-8 border border-white/5 rounded-3xl bg-white/[0.01]">
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
                                {loading ? 'Sending...' : 'Post Message'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 评论列表 - 与其他评论区保持一致的样式 */}
            {loading && comments.length === 0 ? (
                <div className="text-center text-white/40 py-12">加载中...</div>
            ) : comments.length === 0 ? (
                <div className="text-center text-white/40 py-12">
                    还没有留言，来抢沙发吧！
                </div>
            ) : (
                <div>
                    {comments.map((comment, index) => (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group mb-8 animate-in fade-in slide-in-from-left-4 duration-500"
                        >
                            <div className="flex gap-4">
                                {/* Notion 风格头像 - 与其他评论区一致 */}
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
                                            targetType="homepage_comment"
                                            targetId={comment.id}
                                            className="!bg-transparent !p-0 !border-none !h-auto text-white/30 hover:text-white/60 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.section>
    );
}