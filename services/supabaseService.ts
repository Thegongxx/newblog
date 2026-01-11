// Re-export all APIs from modular services
export { supabase } from './supabase';
export { postsApi } from './posts';
export { notesApi } from './notes';
export { commentsApi, noteCommentsApi } from './comments';

// Keep legacy APIs for backward compatibility
import { supabase } from './supabase';

export const pagesApi = {
    async getBySlug(slug: string) {
        const { data, error } = await supabase
            .from('pages')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) throw error;
        return data;
    }
};

export const engagementApi = {
    async incrementView(targetId: string) {
        // 使用简单的 SELECT + UPDATE 方式，避免 RPC 依赖
        const { data: post, error: selectError } = await supabase
            .from('posts')
            .select('views')
            .eq('id', targetId)
            .single();
            
        if (selectError) throw selectError;
        
        const { error: updateError } = await supabase
            .from('posts')
            .update({ views: (post?.views || 0) + 1 })
            .eq('id', targetId);
            
        if (updateError) throw updateError;
    },

    async toggleLike(targetType: string, targetId: string, fingerprint: string) {
        const today = new Date().toISOString().split('T')[0];
        
        // 检查当前内容的点赞次数（单个内容最多5次）
        const { data: existing, error } = await supabase
            .from('likes')
            .select('id, count')
            .eq('target_type', targetType)
            .eq('target_id', targetId)
            .eq('user_fingerprint', fingerprint)
            .gte('created_at', today)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (existing) {
            // 检查单个内容是否已达5次上限
            if (existing.count >= 5) {
                throw new Error('CONTENT_LIMIT_REACHED');
            }
            
            const newCount = existing.count + 1;
            const { error: updateError } = await supabase
                .from('likes')
                .update({ count: newCount })
                .eq('id', existing.id);
            if (updateError) throw updateError;
            return { liked: true, count: newCount };
        } else {
            const { error: insertError } = await supabase
                .from('likes')
                .insert([{
                    target_type: targetType,
                    target_id: targetId,
                    user_fingerprint: fingerprint,
                    count: 1
                }]);
            if (insertError) throw insertError;
            return { liked: true, count: 1 };
        }
    },

    async getLikeCount(targetType: string, targetId: string) {
        const { data, error } = await supabase
            .from('likes')
            .select('count')
            .eq('target_type', targetType)
            .eq('target_id', targetId);
        if (error) return 0;
        return data?.reduce((acc, curr) => acc + (curr.count || 0), 0) || 0;
    }
};
