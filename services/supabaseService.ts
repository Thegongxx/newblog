
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

    // 删除文章
    async delete(id: string) {
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) throw error;
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
    async delete(id: string) {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// 后增：互动相关 API (Likes, Views, Homepage Comments)
export const engagementApi = {
    // 点赞相关
    async toggleLike(targetType: 'post' | 'quote' | 'homepage' | 'comment' | 'homepage_comment', targetId: string, fingerprint: string) {
        const today = new Date().toISOString().split('T')[0];

        // 1. 获取该用户今天的点赞总数（基于指纹和日期）
        const { data: dailyLikes, error: dailyLikesError } = await supabase
            .from('likes')
            .select('count')
            .eq('target_type', targetType)
            .eq('target_id', targetId)
            .eq('user_fingerprint', fingerprint)
            .gte('created_at', today);

        if (dailyLikesError) throw dailyLikesError;

        const currentTotal = dailyLikes?.reduce((acc, curr) => acc + (curr.count || 0), 0) || 0;

        if (currentTotal >= 5) {
            throw new Error('DAILY_LIMIT_REACHED');
        }

        // 2. 检查当前是否已有该记录（累加逻辑）
        const { data: existing, error: existingError } = await supabase
            .from('likes')
            .select('id, count')
            .eq('target_type', targetType)
            .eq('target_id', targetId)
            .eq('user_fingerprint', fingerprint)
            .gte('created_at', today)
            .single();

        if (existingError && existingError.code !== 'PGRST116') { // PGRST116 means no rows found
            throw existingError;
        }

        if (existing) {
            // 累加
            const { error: updateError } = await supabase.from('likes').update({ count: existing.count + 1 }).eq('id', existing.id);
            if (updateError) throw updateError;
            return { liked: true, count: existing.count + 1 };
        } else {
            // 新增
            const { error: insertError } = await supabase.from('likes').insert([{
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
    },

    // 浏览量统计 (简单的 RPC 或直接在前端逻辑里顺便更新)
    async incrementView(postId: string) {
        // 这里使用 Supabase RPC 性能更好，但如果没有配置 RPC，可以先用简单的逻辑
        // 假设已在数据库中创建了 increment_views 函数
        const { error } = await supabase.rpc('increment_views', { post_id: postId });

        // 如果没有 RPC，回退到普通逻辑（注意：会有并发竞争问题，在生产中建议用 RPC）
        if (error) {
            const { data } = await supabase.from('posts').select('views').eq('id', postId).single();
            if (data) {
                await supabase.from('posts').update({ views: (data.views || 0) + 1 }).eq('id', postId);
            }
        }
    },

    // 主页评论相关
    async getHomepageComments() {
        const { data, error } = await supabase
            .from('homepage_comments')
            .select('*')
            .eq('approved', true)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data;
    },

    async createHomepageComment(comment: {
        author: string;
        email: string;
        content: string;
        parent_id?: string;
    }) {
        const { data, error } = await supabase
            .from('homepage_comments')
            .insert([comment])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteHomepageComment(id: string) {
        const { error } = await supabase.from('homepage_comments').delete().eq('id', id);
        if (error) throw error;
    }
};

// 后增：存储相关 API (Image Uploads)
// 存储与媒体库 API
export const storageApi = {
    async uploadImage(file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.round(Math.random() * 1000000)}-${Date.now()}.${fileExt}`;
        const filePath = `blog-media/${fileName}`;

        const { error } = await supabase.storage
            .from('media')
            .upload(filePath, file);

        if (error) throw error;

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

// 统计数据 API
export const statsApi = {
    async getOverview() {
        const [posts, likes, comments, guestbook] = await Promise.all([
            supabase.from('posts').select('id', { count: 'exact', head: true }),
            supabase.from('posts').select('likes_count'),
            supabase.from('comments').select('id', { count: 'exact', head: true }),
            supabase.from('homepage_comments').select('id', { count: 'exact', head: true })
        ]);

        const totalLikes = (likes.data as any[])?.reduce((acc, p) => acc + (p.likes_count || 0), 0) || 0;

        return {
            postsCount: posts.count || 0,
            likesCount: totalLikes,
            commentsCount: (comments.count || 0) + (guestbook.count || 0)
        };
    }
};
