import { supabase } from './supabase';

export const postsApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

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