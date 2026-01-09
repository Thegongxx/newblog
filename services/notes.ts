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
    },

    async deleteFile(noteId: string) {
        // 通过API删除文件系统中的笔记文件
        const response = await fetch('/api/notes/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ noteId })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete note file');
        }

        return await response.json();
    }
};