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
    async toggleLike(targetType: string, targetId: string, fingerprint: string) {
        const today = new Date().toISOString().split('T')[0];
        
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
            const { error: updateError } = await supabase
                .from('likes')
                .update({ count: existing.count + 1 })
                .eq('id', existing.id);
            if (updateError) throw updateError;
            return { liked: true, count: existing.count + 1 };
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

export const storageApi = {
    async uploadImage(file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.round(Math.random() * 1000000)}-${Date.now()}.${fileExt}`;
        const filePath = `blog-media/${fileName}`;

        const { data, error } = await supabase.storage
            .from('media')
            .upload(filePath, file);

        if (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(filePath);

        return publicUrl;
    },

    async listMedia() {
        const { data, error } = await supabase.storage
            .from('media')
            .list('blog-media', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) throw error;

        return data.map(file => {
            const { data: { publicUrl } } = supabase.storage
                .from('media')
                .getPublicUrl(`blog-media/${file.name}`);
            return publicUrl;
        });
    }
};

export const statsApi = {
    async getOverview() {
        const [posts, comments] = await Promise.all([
            supabase.from('posts').select('id', { count: 'exact', head: true }),
            supabase.from('comments').select('id', { count: 'exact', head: true })
        ]);

        return {
            postsCount: posts.count || 0,
            likesCount: 0,
            commentsCount: comments.count || 0
        };
    }
};
