import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LikeButton from './LikeButton';
import type { Comment } from '../types';
import { useIsMobile } from '../hooks/useResponsive';
import { useComments, commentAnimationVariants } from '../hooks/useComments';

export default function HomepageComments() {
    const [showForm, setShowForm] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [parentId, setParentId] = useState('');

    // 表单状态
    const [authorValue, setAuthorValue] = useState('');
    const [emailValue, setEmailValue] = useState('');
    const [contentValue, setContentValue] = useState('');

    const isMobile = useIsMobile();

    // 使用自定义 Hook
    const {
        comments,
        topLevelComments,
        loading,
        submitComment
    } = useComments({
        tableName: 'homepage_comments'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const success = await submitComment({
            author: authorValue,
            email: emailValue,
            content: contentValue,
            parentId
        });

        if (success) {
            // 重置表单
            setAuthorValue('');
            setEmailValue('');
            setContentValue('');
            setParentId('');
            setReplyingTo(null);
            setShowForm(false);
            alert('留言已提交！✨');
        }
    };

    const handleReply = (commentId: string, authorName: string) => {
        setReplyingTo(authorName);
        setParentId(commentId);
        setShowForm(true);
    };

    const renderComment = (comment: Comment, depth = 0) => {
        // 获取回复 (直接从 comments 数组过滤，避免 Hook 依赖循环)
        const replies = comments.filter(c => c.parent_id === comment.id);
        const isNested = depth > 0;

        return (
            <motion.div
                key={comment.id}
                className={`group w-full ${isNested ? 'mt-4' : 'mb-8'}`}
                variants={commentAnimationVariants.comment}
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
                                variants={commentAnimationVariants.comment}
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

            {showForm && (
                <motion.div
                    className="mb-12"
                    variants={commentAnimationVariants.form}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    <div className="p-8 border border-white/5 rounded-3xl bg-white/[0.01]">
                        {replyingTo && (
                            <div className="mb-6 text-xs text-white/40 flex items-center justify-between">
                                <span>回复 <span className="text-white font-bold">@{replyingTo}</span></span>
                                <button
                                    onClick={() => {
                                        setReplyingTo(null);
                                        setParentId('');
                                    }}
                                    className="text-red-400/60 hover:text-red-400 transition-colors duration-300"
                                >
                                    取消
                                </button>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="姓名 *"
                                        value={authorValue}
                                        onChange={(e) => setAuthorValue(e.target.value)}
                                        className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-all duration-300"
                                        required
                                        maxLength={50}
                                        autoComplete="off"
                                    />
                                    {authorValue.length > 40 && (
                                        <span className="absolute -bottom-5 left-0 text-xs text-yellow-400/60">
                                            还能输入 {50 - authorValue.length} 个字符
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="email"
                                    placeholder="邮箱 (可选)"
                                    value={emailValue}
                                    onChange={(e) => setEmailValue(e.target.value)}
                                    className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-all duration-300"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="relative">
                                <textarea
                                    placeholder="写下你的想法..."
                                    value={contentValue}
                                    onChange={(e) => setContentValue(e.target.value)}
                                    rows={4}
                                    className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-all duration-300 resize-none"
                                    required
                                    maxLength={1000}
                                    autoComplete="off"
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <span className={`text-xs transition-colors duration-300 ${contentValue.length > 900 ? 'text-red-400/60' :
                                        contentValue.length > 800 ? 'text-yellow-400/60' :
                                            'text-white/30'
                                        }`}>
                                        {contentValue.length}/1000
                                    </span>
                                    {contentValue.length > 900 && (
                                        <span className="text-xs text-red-400/60">
                                            即将达到字数上限
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
                                >
                                    {loading ? '提交中...' : '发布留言'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            )}

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
                            variants={commentAnimationVariants.comment}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: index * 0.05 }}
                        >
                            {renderComment(comment)}
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.section>
    );
}