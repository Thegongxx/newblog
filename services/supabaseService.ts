
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 文章相关 API
export const postsApi = {
    // 获取所有已发布的文章
    async getAll() {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // 根据 slug 获取单篇文章
    async getBySlug(slug: string) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('slug', slug)
            .eq('published', true)
            .single();

        if (error) throw error;
        return data;
    },

    // 创建新文章（需要认证）
    async create(post: {
        title: string;
        slug: string;
        content: string;
        html_content?: string;
        excerpt?: string;
        category?: string;
        cover_image?: string;
        reading_time?: number;
    }) {
        const { data, error } = await supabase
            .from('posts')
            .insert([post])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// 评论相关 API
export const commentsApi = {
    // 获取文章的所有评论
    async getByPostId(postId: string) {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .eq('approved', true)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    // 创建新评论
    async create(comment: {
        post_id: string;
        author: string;
        email: string;
        content: string;
        parent_id?: string;
    }) {
        const { data, error } = await supabase
            .from('comments')
            .insert([comment])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // 删除评论（需要认证）
    async delete(commentId: string) {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);

        if (error) throw error;
    }
};

// 后增：互动相关 API (Likes, Views, Homepage Comments)
export const engagementApi = {
    // 点赞相关
    async toggleLike(targetType: 'post' | 'quote' | 'homepage', targetId: string, fingerprint: string) {
        // 检查是否已点赞
        const { data: existing } = await supabase
            .from('likes')
            .select('id')
            .match({ target_type: targetType, target_id: targetId, user_fingerprint: fingerprint })
            .single();

        if (existing) {
            // 取消点赞
            await supabase.from('likes').delete().eq('id', existing.id);
            return { liked: false };
        } else {
            // 添加点赞
            await supabase.from('likes').insert([{
                target_type: targetType,
                target_id: targetId,
                user_fingerprint: fingerprint
            }]);
            return { liked: true };
        }
    },

    async getLikeCount(targetType: string, targetId: string) {
        const { count, error } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .match({ target_type: targetType, target_id: targetId });
        if (error) return 0;
        return count || 0;
    },

    // 浏览量统计 (简单的 RPC 或直接在前端逻辑里顺便更新)
    async incrementView(postId: string) {
        // 这里使用 Supabase RPC 性能更好，但如果没有配置 RPC，可以先用简单的逻辑
        // 假设已在数据库中创建了 increment_views 函数
        const { error } = await supabase.rpc('increment_views', { post_id: postId });

        // 如果没有 RPC，回退到普通逻辑（注意：会有并发竞争问题，在生产中建议用 RPC）
        if (error) {
            const { data } = await supabase.from('posts').select('views').eq('id', postId).single();
            if (data) {
                await supabase.from('posts').update({ views: (data.views || 0) + 1 }).eq('id', postId);
            }
        }
    },

    // 主页评论相关
    async getHomepageComments() {
        const { data, error } = await supabase
            .from('homepage_comments')
            .select('*')
            .eq('approved', true)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data;
    },

    async createHomepageComment(comment: {
        author: string;
        email: string;
        content: string;
        parent_id?: string;
    }) {
        const { data, error } = await supabase
            .from('homepage_comments')
            .insert([comment])
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};
