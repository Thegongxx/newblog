import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { postsApi } from '../services/supabaseService';
import type { Post } from '../types';

const About: React.FC = () => {
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                const data = await postsApi.getBySlug('about');
                if (data) setPost(data);
            } catch (error) {
                console.error('Failed to load about page:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAbout();
    }, []);

    if (loading) {
        return (
            <div className="max-w-3xl py-12 relative min-h-[600px] animate-pulse">
                <div className="h-20 w-48 bg-white/5 rounded-lg mb-10" />
                <div className="h-4 w-full bg-white/5 rounded mb-4" />
                <div className="h-4 w-full bg-white/5 rounded mb-4" />
                <div className="h-4 w-2/3 bg-white/5 rounded mb-16" />
                <div className="h-[1px] w-full bg-white/10 mb-16" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="h-32 bg-white/5 rounded-lg" />
                    <div className="h-32 bg-white/5 rounded-lg" />
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-3xl py-12 relative min-h-[600px]">
                <h2 className="text-7xl font-bold tracking-tighter mb-10">关于我.</h2>
                <div className="p-8 border border-white/10 rounded-2xl bg-white/5 text-center">
                    <p className="text-white/40">
                        暂无介绍内容。请在 `content/posts/about.md` 中编写，并确保 slug 为 `about`。
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl py-12 relative min-h-[600px] animate-in fade-in duration-700">
            <Helmet>
                <title>About | Aura</title>
                <meta name="description" content={post.excerpt || "Aura Design Philosophy"} />
            </Helmet>
            <div className="relative z-10">
                <h2 className="text-7xl font-bold tracking-tighter mb-10">{post.title}</h2>
                <article
                    className="prose prose-invert max-w-none prose-p:text-white/60 prose-p:leading-[1.9] prose-p:text-xl prose-p:font-light prose-headings:font-bold prose-headings:tracking-tighter prose-blockquote:border-white/20 prose-blockquote:text-white/80"
                    dangerouslySetInnerHTML={{ __html: post.content }} // 注意：sync script 生成的是 html_content，但 types 可能是 content? 需确认
                />
            </div>
        </div>
    );
};

export default About;
