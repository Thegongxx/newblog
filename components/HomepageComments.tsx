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
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-2xl mx-auto"
        >
            {/* 标题区域 - 与其他评论区保持一致 */}
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

            {/* 评论表单 - 与其他评论区保持一致的样式和动画 */}
            {showForm && (
                <motion.div 
                    className="mb-12 p-8 border border-white/5 rounded-3xl bg-white/[0.01]"
                    initial={{ opacity: 0, height: 0, x: 30 }}
                    animate={{ opacity: 1, height: 'auto', x: 0 }}
                    exit={{ opacity: 0, height: 0, x: 30 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div 
                            className="grid grid-cols-2 gap-4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                            <input
                                type="text"
                                placeholder="Name *"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="px-0 py-2 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-all duration-300"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email (Private)"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="px-0 py-2 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-all duration-300"
                            />
                        </motion.div>
                        <motion.textarea
                            placeholder="Share your thoughts..."
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={3}
                            className="w-full px-0 py-2 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-all duration-300 resize-none"
                            required
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                        />
                        <motion.div 
                            className="flex justify-end"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Post Message'}
                            </button>
                        </motion.div>
                    </form>
                </motion.div>
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
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                            className="group mb-8"
                            whileHover={{ x: 4, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }}
                        >
                            <div className="flex gap-4">
                                {/* Notion 风格头像 - 与其他评论区一致 */}
                                <motion.div 
                                    className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-[10px] font-black text-white/60"
                                    whileHover={{ 
                                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                                        borderColor: "rgba(255, 255, 255, 0.2)",
                                        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                                    }}
                                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                                >
                                    {comment.author[0].toUpperCase()}
                                </motion.div>

                                <div className="flex-1 min-w-0">
                                    <motion.div 
                                        className="flex items-center gap-3 mb-1"
                                        whileHover={{ 
                                            x: 2,
                                            transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                                        }}
                                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                                    >
                                        <span className="font-bold text-white text-sm tracking-tight">{comment.author}</span>
                                        <motion.span 
                                            className="text-white/20 text-[10px] font-medium"
                                            whileHover={{ 
                                                color: "rgba(255, 255, 255, 0.4)",
                                                transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                                            }}
                                            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                                        >
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </motion.span>
                                    </motion.div>

                                    <motion.p 
                                        className="text-white/70 text-sm leading-relaxed mb-3 whitespace-pre-wrap"
                                        whileHover={{ 
                                            color: "rgba(255, 255, 255, 0.85)",
                                            x: 2,
                                            transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                                        }}
                                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                                    >
                                        {comment.content}
                                    </motion.p>

                                    <motion.div 
                                        className="flex items-center gap-6 opacity-0 group-hover:opacity-100"
                                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                                        whileHover={{ 
                                            x: 2,
                                            transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                                        }}
                                    >
                                        <LikeButton
                                            targetType="homepage_comment"
                                            targetId={comment.id}
                                            className="!bg-transparent !p-0 !border-none !h-auto text-white/30 hover:text-white/60 transition-all duration-300"
                                        />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.section>
    );
}