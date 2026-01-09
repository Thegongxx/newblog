import { supabase } from './supabase';

export const notesApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase.from('notes').delete().eq('id', id);
        if (error) throw error;
    }
};