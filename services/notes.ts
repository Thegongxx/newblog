import { supabase } from './supabase';

export const notesApi = {
    async getAll() {
        // 获取 notes 数据并计算点赞数
        const { data: notes, error } = await supabase
            .from('notes')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;

        // 为每个 note 计算点赞总数
        const notesWithLikes = await Promise.all(
            notes.map(async (note) => {
                const { data: likes } = await supabase
                    .from('likes')
                    .select('count')
                    .eq('target_type', 'note')
                    .eq('target_id', note.id);
                
                const likes_count = likes?.reduce((acc, curr) => acc + (curr.count || 0), 0) || 0;
                return { ...note, likes_count };
            })
        );

        return notesWithLikes;
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