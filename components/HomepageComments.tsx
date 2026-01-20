import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseService';
import LikeButton from './LikeButton';
import type { Comment } from '../types';
import { useIsMobile } from '../hooks/useResponsive';
import { useToast } from './Toast';

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
    const { showToast, ToastComponent } = useToast();

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
        
        // 清理和验证输入
        const cleanAuthor = formData.author.trim();
        const cleanContent = formData.content.trim();
        const cleanEmail = formData.email.trim();
        
        if (!cleanAuthor || !cleanContent) {
            showToast('请填写姓名和内容哦 🌿', 'error');
            return;
        }

        // 验证内容长度
        if (cleanContent.length > 1000) {
            showToast('评论内容太长了，请控制在1000字以内 📝', 'error');
            return;
        }

        if (cleanAuthor.length > 50) {
            showToast('姓名太长了，请控制在50字以内 ✨', 'error');
            return;
        }

        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('homepage_comments')
                .insert([{
                    author: cleanAuthor,
                    email: cleanEmail || 'anonymous@example.com',
                    content: cleanContent,
                    parent_id: formData.parent_id || null,
                    approved: true
                }])
                .select()
                .single();

            if (error) {
                console.error('Supabase insert error:', error);
                throw error;
            }

            setFormData({ author: '', email: '', content: '', parent_id: '' });
            setReplyingTo(null);
            setShowForm(false);
            await loadComments();
            showToast('留言已提交！✨', 'success');
        } catch (error) {
            console.error('Failed to submit comment:', error);
            if (error instanceof Error) {
                if (error.message.includes('duplicate') || error.message.includes('unique')) {
                    showToast('留言重复了，请不要重复提交 😊', 'error');
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    showToast('网络连接有问题，请检查网络后重试 🌐', 'error');
                } else {
                    showToast('留言提交失败，请稍后重试 😅', 'error');
                }
            } else {
                showToast('留言提交失败，请检查网络或稍后重试 🔄', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReply = (commentId: string, authorName: string) => {
        setReplyingTo(authorName);
        setFormData({ ...formData, parent_id: commentId });
        setShowForm(true);
    };

    const commentVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { 
            opacity: 1, 
            y: 0,
            transition: {
                type: "spring" as const,
                stiffness: 300,
                damping: 30,
                duration: 0.4
            }
        }
    };

    const formVariants = {
        initial: { opacity: 0, height: 0, scale: 0.95 },
        animate: { 
            opacity: 1, 
            height: 'auto', 
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 300,
                damping: 30,
                duration: 0.5
            }
        },
        exit: { 
            opacity: 0, 
            height: 0, 
            scale: 0.95,
            transition: {
                type: "spring" as const,
                stiffness: 300,
                damping: 30,
                duration: 0.4
            }
        }
    };

    const renderComment = (comment: Comment, depth = 0) => {
        const replies = comments.filter(c => c.parent_id === comment.id);
        const isNested = depth > 0;

        return (
            <motion.div
                key={comment.id}
                className={`group w-full ${isNested ? 'mt-4' : 'mb-8'}`}
                variants={commentVariants}
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
                                transition: {
                                    type: "spring" as const,
                                    stiffness: 400,
                                    damping: 25,
                                    duration: 0.2
                                }
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
                        animate={{ 
                            opacity: 1, 
                            height: 'auto',
                            transition: {
                                type: "spring" as const,
                                stiffness: 300,
                                damping: 30,
                                duration: 0.4
                            }
                        }}
                    >
                        {replies.map((reply, index) => (
                            <motion.div
                                key={reply.id}
                                variants={commentVariants}
                                initial="initial"
                                animate="animate"
                                transition={{ delay: index * 0.05 }}
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
            <motion.div
                className="flex items-center justify-between mb-12"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
                <motion.h3
                    className="text-xl font-black text-white tracking-tight uppercase"
                    whileHover={{
                        x: 2,
                        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                    }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    Guest Book <motion.span
                        className="text-white/20 ml-2"
                        whileHover={{
                            color: "rgba(255, 255, 255, 0.4)",
                            transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                        }}
                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        {comments.length}
                    </motion.span>
                </motion.h3>
                <motion.button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white relative overflow-hidden group"
                    whileHover={{
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                    }}
                    whileTap={{
                        scale: 0.98,
                        transition: { duration: 0.1 }
                    }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    {/* 悬停时的光晕效果 */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 rounded-full"
                        whileHover={{
                            opacity: 1,
                            transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                        }}
                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                    <motion.span
                        className="relative z-10"
                        whileHover={{
                            letterSpacing: "0.05em",
                            transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                        }}
                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        {showForm ? '取消' : '写留言'}
                    </motion.span>
                </motion.button>
            </motion.div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        className="mb-12 overflow-hidden"
                        variants={formVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        <motion.div
                            className="p-8 border border-white/5 rounded-3xl bg-white/[0.01]"
                            initial={{
                                y: -10,
                                opacity: 0
                            }}
                            animate={{
                                y: 0,
                                opacity: 1
                            }}
                            exit={{
                                y: -10,
                                opacity: 0
                            }}
                            transition={{
                                type: "spring" as const,
                                stiffness: 400,
                                damping: 25,
                                delay: 0.1
                            }}
                        >
                            {replyingTo && (
                                <motion.div
                                    className="mb-6 text-xs text-white/40 flex items-center justify-between"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                >
                                    <span>Replying to <span className="text-white font-bold">@{replyingTo}</span></span>
                                    <button
                                        onClick={() => {
                                            setReplyingTo(null);
                                            setFormData({ ...formData, parent_id: '' });
                                        }}
                                        className="text-red-400/60 hover:text-red-400 transition-colors duration-300"
                                    >
                                        Cancel
                                    </button>
                                </motion.div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <motion.div
                                    className="grid grid-cols-2 gap-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                >
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Name *"
                                            value={formData.author}
                                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                            className="w-full px-0 py-2 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-all duration-300"
                                            required
                                            maxLength={50}
                                        />
                                        {formData.author.length > 40 && (
                                            <span className="absolute -bottom-5 left-0 text-xs text-yellow-400/60">
                                                {50 - formData.author.length} 字符剩余
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Email (Private)"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-0 py-2 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-all duration-300"
                                    />
                                </motion.div>
                                <motion.div className="relative">
                                    <motion.textarea
                                        placeholder="Share your thoughts..."
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        rows={3}
                                        className="w-full px-0 py-2 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-all duration-300 resize-none"
                                        required
                                        maxLength={1000}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <span className={`text-xs transition-colors duration-300 ${
                                            formData.content.length > 900 ? 'text-red-400/60' :
                                            formData.content.length > 800 ? 'text-yellow-400/60' :
                                            'text-white/20'
                                        }`}>
                                            {formData.content.length}/1000
                                        </span>
                                        {formData.content.length > 900 && (
                                            <span className="text-xs text-red-400/60">
                                                内容即将达到上限
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                                <motion.div
                                    className="flex justify-end"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.45, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                >
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="relative px-8 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-70 overflow-hidden"
                                    >
                                        <span className={loading ? 'opacity-0' : 'opacity-100'}>
                                            {loading ? 'Sending...' : 'Post Message'}
                                        </span>
                                        {loading && (
                                            <motion.div
                                                className="absolute inset-0 flex items-center justify-center"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                <div className="flex gap-1">
                                                    {[0, 1, 2].map((i) => (
                                                        <motion.div
                                                            key={i}
                                                            className="w-1.5 h-1.5 bg-black rounded-full"
                                                            animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                                                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                                        />
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </button>
                                </motion.div>
                            </form>
                        </motion.div>
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
                            variants={commentVariants}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: index * 0.05 }}
                        >
                            {renderComment(comment)}
                        </motion.div>
                    ))}
                </div>
            )}
            <ToastComponent />
        </motion.section>
    );
}