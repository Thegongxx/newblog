/**
 * 共享评论组件的通用逻辑
 * 可被 CommentSection 和 HomepageComments 复用
 */

import { useState, useCallback } from 'react';
import { supabase } from '../services/supabaseService';
import type { Comment } from '../types';

export interface CommentFormData {
    author: string;
    email: string;
    content: string;
    parentId: string;
}

export interface UseCommentsOptions {
    tableName: 'post_comments' | 'note_comments' | 'homepage_comments';
    foreignKey?: 'post_id' | 'note_id';
    targetId?: string;
}

export function useComments({ tableName, foreignKey, targetId }: UseCommentsOptions) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadComments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from(tableName)
                .select('*')
                .eq('approved', true)
                .order('created_at', { ascending: true });

            // 如果有外键约束，添加过滤条件
            if (foreignKey && targetId) {
                query = query.eq(foreignKey, targetId);
            }

            const { data, error: queryError } = await query;

            if (queryError) {
                console.error(`Failed to load ${tableName}:`, queryError);
                setError(queryError.message);
                return;
            }

            setComments(data || []);
        } catch (err) {
            console.error(`Unexpected error loading ${tableName}:`, err);
            setError(err instanceof Error ? err.message : '加载失败');
        } finally {
            setLoading(false);
        }
    }, [tableName, foreignKey, targetId]);

    const submitComment = useCallback(async (formData: CommentFormData): Promise<boolean> => {
        const { author, email, content, parentId } = formData;

        const cleanAuthor = author.trim();
        const cleanContent = content.trim();
        const cleanEmail = email.trim();

        // 验证
        if (!cleanAuthor || !cleanContent) {
            alert('请填写姓名和内容哦 🌿');
            return false;
        }

        if (cleanContent.length > 1000) {
            alert('评论内容太长了，请控制在1000字以内 📝');
            return false;
        }

        if (cleanAuthor.length > 50) {
            alert('姓名太长了，请控制在50字以内 ✨');
            return false;
        }

        try {
            setLoading(true);

            const insertData: Record<string, any> = {
                author: cleanAuthor,
                email: cleanEmail || 'anonymous@example.com',
                content: cleanContent,
                parent_id: parentId || null,
                approved: true,
            };

            // 添加外键
            if (foreignKey && targetId) {
                insertData[foreignKey] = targetId;
            }

            const { error: insertError } = await supabase
                .from(tableName)
                .insert([insertData])
                .select()
                .single();

            if (insertError) {
                console.error(`Supabase insert error:`, insertError);
                throw insertError;
            }

            await loadComments();
            return true;
        } catch (err) {
            console.error(`Failed to submit comment:`, err);

            if (err instanceof Error) {
                if (err.message.includes('duplicate') || err.message.includes('unique')) {
                    alert('评论重复了，请不要重复提交 😊');
                } else if (err.message.includes('network') || err.message.includes('fetch')) {
                    alert('网络连接有问题，请检查网络后重试 🌐');
                } else {
                    alert(`评论提交失败: ${err.message} 😅`);
                }
            } else {
                alert('评论提交失败，请检查网络或稍后重试 🔄');
            }
            return false;
        } finally {
            setLoading(false);
        }
    }, [tableName, foreignKey, targetId, loadComments]);

    // 获取顶级评论
    const topLevelComments = comments.filter(c => !c.parent_id);

    // 获取某条评论的回复
    const getReplies = useCallback((commentId: string) => {
        return comments.filter(c => c.parent_id === commentId);
    }, [comments]);

    return {
        comments,
        topLevelComments,
        getReplies,
        loading,
        error,
        loadComments,
        submitComment,
    };
}

// 共享的动画变体
export const commentAnimationVariants = {
    comment: {
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
    },
    form: {
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
    }
};
