import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseService';
import LikeButton from './LikeButton';
import type { Comment } from '../types';
import { useToast } from '../hooks/useToast';
import { useIsMobile } from '../hooks/useResponsive';
import { useChineseInput } from '../hooks/useChineseInput';

interface CommentSectionProps {
    targetId: string;
    targetType: 'post' | 'note';
}

export default function CommentSection({ targetId, targetType = 'post' }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [parentId, setParentId] = useState('');
    
    // 使用中文输入Hook
    const authorInput = useChineseInput();
    const emailInput = useChineseInput();
    const contentInput = useChineseInput();
    
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
                const result = await supabase
                    .from('post_comments')
                    .select('*')
                    .eq('post_id', targetId)
                    .eq('approved', true)
                    .order('created_at', { ascending: true });
                data = result.data;
                error = result.error;
            } else {
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
        
        const cleanAuthor = authorInput.value.trim();
        const cleanContent = contentInput.value.trim();
        const cleanEmail = emailInput.value.trim();
        
        if (!cleanAuthor || !cleanContent) {
            alert('请填写姓名和内容哦 🌿');
            return;
        }

        if (cleanContent.length > 1000) {
            alert('评论内容太长了，请控制在1000字以内 📝');
            return;
        }

        if (cleanAuthor.length > 50) {
            alert('姓名太长了，请控制在50字以内 ✨');
            return;
        }

        try {
            setLoading(true);
            console.log('Submitting comment:', { cleanAuthor, cleanContent, cleanEmail });

            let data, error;

            if (targetType === 'post') {
                const result = await supabase
                    .from('post_comments')
                    .insert([{
                        post_id: targetId,
                        author: cleanAuthor,
                        email: cleanEmail || 'anonymous@example.com',
                        content: cleanContent,
                        parent_id: parentId || null,
                        approved: true
                    }])
                    .select()
                    .single();
                data = result.data;
                error = result.error;
            } else {
                const result = await supabase
                    .from('note_comments')
                    .insert([{
                        note_id: targetId,
                        author: cleanAuthor,
                        email: cleanEmail || 'anonymous@example.com',
                        content: cleanContent,
                        parent_id: parentId || null,
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
            authorInput.reset();
            emailInput.reset();
            contentInput.reset();
            setParentId('');
            setReplyingTo(null);
            setShowForm(false);

            await loadComments();
            alert('评论已提交，已轻轻放在这里 ✨');
        } catch (error) {
            console.error('Failed to submit comment:', error);
            if (error instanceof Error) {
                if (error.message.includes('duplicate') || error.message.includes('unique')) {
                    alert('评论重复了，请不要重复提交 😊');
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    alert('网络连接有问题，请检查网络后重试 🌐');
                } else {
                    alert('评论提交失败，请稍后重试 😅');
                }
            } else {
                alert('评论提交失败，请检查网络或稍后重试 🔄');
            }
        } finally {
            setLoading(false);
        }
    };

    // 回复评论
    const handleReply = (commentId: string, authorName: string) => {
        setReplyingTo(authorName);
        setParentId(commentId);
        setShowForm(true);
    };

    const renderComment = (comment: Comment, depth = 0) => {
        const replies = comments.filter(c => c.parent_id === comment.id);
        const isNested = depth > 0;

        return (
            <div key={comment.id} className={`group w-full ${isNested ? 'mt-4' : 'mb-8'}`}>
                <div className={`
                    relative 
                    ${isNested ? 'bg-white/[0.03] border border-white/5 rounded-2xl p-4' : ''}
                    transition-colors duration-300
                `}>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-[10px] font-black text-white/60">
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

                            <div className={`flex items-center gap-6 transition-opacity duration-300 ${isMobile ? 'opacity-100 mt-2' : 'opacity-0 group-hover:opacity-100'}`}>
                                <LikeButton
                                    targetType="comment"
                                    targetId={comment.id}
                                    className="!bg-transparent !p-0 !border-none !h-auto text-white/30 hover:text-white/60 transition-all duration-300"
                                />
                                <button
                                    onClick={() => handleReply(comment.id, comment.author)}
                                    className="text-[10px] font-bold text-white/30 hover:text-white uppercase tracking-widest transition-colors duration-300"
                                >
                                    回复
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {replies.length > 0 && (
                    <div className={`${isNested ? 'ml-0 border-l border-white/10 mt-3 pl-3' : 'ml-4 pl-4 border-l border-white/5 mt-4'}`}>
                        {replies.map((reply) => renderComment(reply, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    const topLevelComments = comments.filter(c => !c.parent_id);

    return (
        <div className="mt-24 max-w-2xl">
            <div className="flex items-center justify-between mb-12">
                <h3 className="text-xl font-black text-white tracking-tight uppercase">
                    讨论 <span className="text-white/20 ml-2">{comments.length}</span>
                </h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all duration-300"
                >
                    {showForm ? '取消' : '写评论'}
                </button>
            </div>

            {/* 评论表单 */}
            {showForm && (
                <div className="mb-12">
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
                                        value={authorInput.value}
                                        {...authorInput.handlers}
                                        className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-all duration-300"
                                        required
                                        maxLength={50}
                                        autoComplete="off"
                                        spellCheck={false}
                                    />
                                    {authorInput.value.length > 40 && (
                                        <span className="absolute -bottom-5 left-0 text-xs text-yellow-400/60">
                                            还能输入 {50 - authorInput.value.length} 个字符
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="email"
                                    placeholder="邮箱 (可选)"
                                    value={emailInput.value}
                                    {...emailInput.handlers}
                                    className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-all duration-300"
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                            </div>
                            <div className="relative">
                                <textarea
                                    placeholder="写下你的想法..."
                                    value={contentInput.value}
                                    {...contentInput.handlers}
                                    rows={4}
                                    className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-all duration-300 resize-none"
                                    required
                                    maxLength={1000}
                                    autoComplete="off"
                                    spellCheck={false}
                                    style={{ imeMode: 'active' }}
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <span className={`text-xs transition-colors duration-300 ${
                                        contentInput.value.length > 900 ? 'text-red-400/60' :
                                        contentInput.value.length > 800 ? 'text-yellow-400/60' :
                                        'text-white/30'
                                    }`}>
                                        {contentInput.value.length}/1000
                                    </span>
                                    {contentInput.value.length > 900 && (
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
                                    {loading ? '提交中...' : '发布评论'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 评论列表 */}
            {loading && comments.length === 0 ? (
                <div className="text-center text-white/40 py-12">
                    加载中...
                </div>
            ) : topLevelComments.length === 0 ? (
                <div className="text-center text-white/40 py-12">
                    还没有评论，来抢沙发吧！
                </div>
            ) : (
                <div>
                    {topLevelComments.map((comment) => renderComment(comment))}
                </div>
            )}
        </div>
    );
}