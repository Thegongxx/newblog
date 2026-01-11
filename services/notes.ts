import { supabase } from './supabase';

export const notesApi = {
    async getAll() {
        // 获取 notes 数据并计算点赞数
        const { data: notes, error } = await supabase
            .from('notes')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;

        const ids = notes.map((n) => n.id).filter(Boolean);
        if (ids.length === 0) return notes;

        const { data: likes } = await supabase
            .from('likes')
            .select('target_id, count')
            .eq('target_type', 'note')
            .in('target_id', ids);

        const likeMap = (likes || []).reduce<Record<string, number>>((acc, row: any) => {
            const key = row.target_id;
            if (!key) return acc;
            acc[key] = (acc[key] || 0) + (row.count || 0);
            return acc;
        }, {});

        return notes.map((note) => ({
            ...note,
            likes_count: likeMap[note.id] || 0
        }));
    },

    async getById(id: string) {
        const { data: note, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;

        // 计算点赞总数
        const { data: likes } = await supabase
            .from('likes')
            .select('count')
            .eq('target_type', 'note')
            .eq('target_id', id);
        
        const likes_count = likes?.reduce((acc, curr) => acc + (curr.count || 0), 0) || 0;
        return { ...note, likes_count };
    },

    async delete(id: string) {
        const { error } = await supabase.from('notes').delete().eq('id', id);
        if (error) throw error;
    }
};