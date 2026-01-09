import { supabase } from './supabase';

export const commentsApi = {
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

    async delete(id: string) {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

export const noteCommentsApi = {
    async getByNoteId(noteId: string) {
        const { data, error } = await supabase
            .from('note_comments')
            .select('*')
            .eq('note_id', noteId)
            .eq('approved', true)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data;
    },

    async create(comment: {
        note_id: string;
        author: string;
        email: string;
        content: string;
        parent_id?: string;
    }) {
        const { data, error } = await supabase
            .from('note_comments')
            .insert([comment])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase.from('note_comments').delete().eq('id', id);
        if (error) throw error;
    }
};