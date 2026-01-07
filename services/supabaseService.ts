
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
