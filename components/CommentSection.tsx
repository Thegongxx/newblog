import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseService';
import LikeButton from './LikeButton';
import type { Comment } from '../types';
import { useToast } from '../hooks/useToast';
import { useIsMobile } from '../hooks/useResponsive';

interface CommentSectionProps {
    targetId: string;
    targetType: 'post' | 'note';
}

export default function CommentSection({ targetId, targetType = 'post' }: CommentSectionProps) {
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
    const { showToast } = useToast();
    const isMobile = useIsMobile();

    // 加载评论
    React.useEffect(() => {
        loadComments();
    }, [targetId, targetType]);

    const loadComments = async () => {
        try {
            setLoading(true);
            console.log(`Loading ${targetType} comments for ID:`, targetId);

            let data, error;

            if (targetType === 'post') {
                // 使用独立的 post_comments 表，post_id 现在是 UUID
                const result = await supabase
                    .from('post_comments')
                    .select('*')
                    .eq('post_id', targetId)
                    .eq('approved', true)
                    .order('created_at', { ascending: true });
                data = result.data;
                error = result.error;
            } else {
                // 使用独立的 note_comments 表，note_id 现在是 UUID
                const result = await supabase
                    .from('note_comments')
                    .select('*')
                    .eq('note_id', targetId)
                    .eq('approved', true)
                    .order('created_at', { ascending: true });
                data = result.data;
                error = result.error;
            }

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Comments loaded:', data);
            setComments(data || []);
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
            console.log('Submitting comment:', formData);

            let data, error;

            if (targetType === 'post') {
                // 插入到独立的 post_comments 表
                const result = await supabase
                    .from('post_comments')
                    .insert([{
                        post_id: targetId,
                        author: formData.author,
                        email: formData.email,
                        content: formData.content,
                        parent_id: formData.parent_id || null,
                        approved: true
                    }])
                    .select()
                    .single();
                data = result.data;
                error = result.error;
            } else {
                // 插入到独立的 note_comments 表
                const result = await supabase
                    .from('note_comments')
                    .insert([{
                        note_id: targetId,
                        author: formData.author,
                        email: formData.email,
                        content: formData.content,
                        parent_id: formData.parent_id || null,
                        approved: true
                    }])
                    .select()
                    .single();
                data = result.data;
                error = result.error;
            }

            if (error) {
                console.error('Supabase insert error:', error);
                throw error;
            }

            console.log('Comment created successfully:', data);

            // 重置表单
            setFormData({ author: '', email: '', content: '', parent_id: '' });
            setReplyingTo(null);
            setShowForm(false);

            // 重新加载评论
            await loadComments();
            showToast('评论已提交，已轻轻放在这里。', 'success');
        } catch (error) {
            console.error('Failed to submit comment:', error);
            if (error instanceof Error) {
                showToast(`评论提交失败：${error.message}`, 'error');
            } else {
                showToast('评论提交失败，请检查网络或稍后重试。', 'error');
            }
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

    // 渲染嵌套评论 - 使用与notes一致的苹果风格动画
    const renderComment = (comment: Comment, depth = 0) => {
        const replies = comments.filter(c => c.parent_id === comment.id);

        // Use depth for styling instead of raw margin
        const isNested = depth > 0;

        return (
            <motion.div
                key={comment.id}
                className={`group w-full ${isNested ? 'mt-4' : 'mb-8'}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
                {/* Comment Content Card */}
                <div className={`
                    relative 
                    ${isNested ? 'bg-white/[0.03] border border-white/5 rounded-2xl p-4' : ''}
                    transition-colors duration-300
                `}>
                    <div className="flex gap-4">
                        {/* Avatar */}
                        <motion.div
                            className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-[10px] font-black text-white/60"
                            whileHover={{
                                backgroundColor: "rgba(255, 255, 255, 0.15)",
                                borderColor: "rgba(255, 255, 255, 0.2)",
                                transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                            }}
                        >
                            {comment.author[0].toUpperCase()}
                        </motion.div>

                        <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-1">
                                <span className="font-bold text-white text-sm tracking-tight">{comment.author}</span>
                                <span className="text-white/20 text-[10px] font-medium">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Content */}
                            <p className="text-white/70 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                                {comment.content}
                            </p>

                            {/* Actions */}
                            <div
                                className={`flex items-center gap-6 transition-opacity duration-300 ${isMobile ? 'opacity-100 mt-2' : 'opacity-0 group-hover:opacity-100'}`}
                            >
                                <LikeButton
                                    targetType="comment"
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

                {/* Nested Replies Container */}
                {replies.length > 0 && (
                    <motion.div
                        className={`
                            ${isNested ? 'ml-0 border-l border-white/10 mt-3 pl-3' : 'ml-4 pl-4 border-l border-white/5 mt-4'}
                        `}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{
                            opacity: 1,
                            height: 'auto',
                            transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                        }}
                    >
                        {replies.map((reply, index) => (
                            <motion.div
                                key={reply.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    transition: { delay: index * 0.05, duration: 0.4 }
                                }}
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
        <div className="mt-24 max-w-2xl">
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
                    Discussion <motion.span
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
                        {showForm ? '取消' : '写评论'}
                    </motion.span>
                </motion.button>
            </motion.div>

            {/* 评论表单 */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        className="mb-12 p-8 border border-white/5 rounded-3xl bg-white/[0.01] overflow-hidden"
                        initial={{
                            opacity: 0,
                            height: 0,
                            x: 30
                        }}
                        animate={{
                            opacity: 1,
                            height: 'auto',
                            x: 0
                        }}
                        exit={{
                            opacity: 0,
                            height: 0,
                            x: 30
                        }}
                        transition={{
                            duration: 0.4,
                            ease: [0.25, 0.1, 0.25, 1]
                        }}
                    >
                        {replyingTo && (
                            <motion.div
                                className="mb-6 text-xs text-white/40 flex items-center justify-between"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
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
                                    className="relative px-8 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-70 overflow-hidden"
                                >
                                    <span className={loading ? 'opacity-0' : 'opacity-100'}>Post Comment</span>
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
                )}
            </AnimatePresence>

            {/* 评论列表 */}
            {loading && comments.length === 0 ? (
                <motion.div
                    className="text-center text-white/40 py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    加载中...
                </motion.div>
            ) : topLevelComments.length === 0 ? (
                <motion.div
                    className="text-center text-white/40 py-12"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    还没有评论，来抢沙发吧！
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {topLevelComments.map((comment, index) => (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                                duration: 0.4,
                                delay: index * 0.05,
                                ease: [0.25, 0.1, 0.25, 1]
                            }}
                        >
                            {renderComment(comment)}
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
