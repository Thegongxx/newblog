import { supabase } from './supabase';

export const postsApi = {
    async getAll() {
        // 获取 posts 数据
        const { data: posts, error } = await supabase
            .from('posts')
            .select('*')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // 为每个 post 计算点赞总数
        const postsWithLikes = await Promise.all(
            posts.map(async (post) => {
                const { data: likes } = await supabase
                    .from('likes')
                    .select('count')
                    .eq('target_type', 'post')
                    .eq('target_id', post.id);
                
                const likes_count = likes?.reduce((acc, curr) => acc + (curr.count || 0), 0) || 0;
                return { ...post, likes_count };
            })
        );

        return postsWithLikes;
    },

    async getBySlug(slug: string) {
        const { data: post, error } = await supabase
            .from('posts')
            .select('*')
            .eq('slug', slug)
            .eq('published', true)
            .single();

        if (error) throw error;

        // 计算点赞总数
        const { data: likes } = await supabase
            .from('likes')
            .select('count')
            .eq('target_type', 'post')
            .eq('target_id', post.id);
        
        const likes_count = likes?.reduce((acc, curr) => acc + (curr.count || 0), 0) || 0;
        return { ...post, likes_count };
    },

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
    },

    async delete(id: string) {
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) throw error;
    }
};