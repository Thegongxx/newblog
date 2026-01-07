
import React, { useState, useEffect, useRef } from 'react';
import { supabase, postsApi, engagementApi } from '../services/supabaseService';
import { ICONS } from '../constants';
import type { Post, Comment } from '../types';
import matter from 'gray-matter';
import { marked } from 'marked';

export default function Admin() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tab, setTab] = useState<'posts' | 'comments' | 'stats'>('posts');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert(error.message);
        setLoading(false);
    };

    const handleLogout = () => supabase.auth.signOut();

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505]">
                <div className="w-full max-w-md glass p-12 rounded-[3rem] animate-in fade-in zoom-in duration-700">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-white/10 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tighter">AURA ADMIN</h1>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <input type="email" placeholder="Email" className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-white/30 transition-all" value={email} onChange={e => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Password" className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-white/30 transition-all" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="submit" disabled={loading} className="w-full h-14 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all text-sm tracking-widest uppercase">
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] pt-40 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div>
                        <h2 className="text-6xl font-black tracking-tighter italic">STUDIO.</h2>
                        <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                            <span>{session.user.email}</span>
                            <button onClick={handleLogout} className="text-rose-500/60 hover:text-rose-500 transition-colors">Logout</button>
                        </div>
                    </div>
                    <nav className="flex items-center gap-2 p-1.5 glass rounded-full">
                        {['posts', 'comments', 'stats'].map(id => (
                            <button key={id} onClick={() => setTab(id as any)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tab === id ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}>
                                {id}
                            </button>
                        ))}
                    </nav>
                </header>
                <main>{tab === 'posts' && <PostManager />}</main>
            </div>
        </div>
    );
}

function PostManager() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadPosts(); }, []);

    const loadPosts = async () => {
        try { setLoading(true); const data = await postsApi.getAll(); setPosts(data as any); }
        finally { setLoading(false); }
    };

    const handleCreate = () => setEditingPost({ title: '', content: '', category: 'Technical', published: false });

    if (editingPost) return <PostEditor post={editingPost} onSave={() => { setEditingPost(null); loadPosts(); }} onCancel={() => setEditingPost(null)} />;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold tracking-tight">Recent Articles</h3>
                <button onClick={handleCreate} className="h-12 px-8 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">New Story</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {posts.map(post => (
                    <div key={post.id} className="glass p-8 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                                {post.cover_image && <img src={post.cover_image} className="w-full h-full object-cover transition-opacity opacity-60 group-hover:opacity-100" />}
                            </div>
                            <div>
                                <h4 className="text-xl font-bold">{post.title}</h4>
                                <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest text-white/20">
                                    <span className={post.published ? 'text-emerald-500/60' : 'text-amber-500/60'}>{post.published ? 'PUBLISHED' : 'DRAFT'}</span>
                                    <span>•</span>
                                    <span>{post.category}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingPost(post)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" /></svg></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PostEditor({ post, onSave, onCancel }: { post: Partial<Post>, onSave: () => void, onCancel: () => void }) {
    const [formData, setFormData] = useState({
        title: post.title || '',
        slug: post.slug || '',
        content: post.content || '',
        category: post.category || 'Thought',
        cover_image: post.cover_image || '',
        published: post.published ?? false
    });
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const { data, content } = matter(text);
            setFormData({
                ...formData,
                title: data.title || formData.title,
                slug: data.slug || formData.slug || (data.title ? data.title.toLowerCase().replace(/ /g, '-') : ''),
                content: content || formData.content,
                category: data.category || formData.category,
                cover_image: data.cover_image || formData.cover_image,
                published: data.published ?? false
            });
        };
        reader.readAsText(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const postData = { ...formData, html_content: marked(formData.content), reading_time: Math.ceil(formData.content.length / 500) };
            if (post.id) {
                const { error } = await supabase.from('posts').update(postData).eq('id', post.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('posts').insert([postData]);
                if (error) throw error;
            }
            onSave();
        } catch (err) { alert(err instanceof Error ? err.message : 'Error saving post'); }
        finally { setLoading(false); }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-12">
                <button onClick={onCancel} className="group flex items-center gap-2 text-white/30 hover:text-white transition-all text-sm font-bold uppercase tracking-widest">
                    <div className="rotate-180 group-hover:-translate-x-1 transition-transform">{ICONS.CHEVRON_RIGHT}</div>
                    <span>Cancel</span>
                </button>
                <div className="flex items-center gap-4">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".md" />
                    <button onClick={() => fileInputRef.current?.click()} className="px-6 h-10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all">Import MD</button>
                    <button onClick={handleSubmit} disabled={loading} className="px-10 h-10 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all">
                        {loading ? 'Saving...' : 'Publish'}
                    </button>
                </div>
            </div>
            <form className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-transparent border-none text-4xl md:text-6xl font-black tracking-tighter placeholder:text-white/5 outline-none" />
                    <div className="grid grid-cols-2 gap-6">
                        <input type="text" placeholder="Slug" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-xs outline-none" />
                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-xs outline-none appearance-none">
                            <option value="Technical">Technical</option>
                            <option value="Design">Design</option>
                            <option value="Thought">Thought</option>
                            <option value="Life">Life</option>
                        </select>
                    </div>
                    <input type="text" placeholder="Cover Image URL" value={formData.cover_image} onChange={e => setFormData({ ...formData, cover_image: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-xs outline-none" />
                    <textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full min-h-[500px] bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 text-lg font-light leading-relaxed outline-none focus:border-white/10 transition-all resize-none" placeholder="Write your story..." />
                </div>
                <div className="hidden lg:block sticky top-40 h-[calc(100vh-200px)]">
                    <div className="w-full h-full glass rounded-[3rem] p-12 overflow-y-auto prose prose-invert max-w-none prose-p:text-white/60 prose-headings:text-white prose-headings:tracking-tighter prose-img:rounded-3xl">
                        <h1 className="text-4xl font-black mb-8 italic tracking-tighter">{formData.title || 'Preview'}</h1>
                        <div dangerouslySetInnerHTML={{ __html: marked(formData.content) }} />
                    </div>
                </div>
            </form>
        </div>
    );
}
