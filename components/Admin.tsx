import React, { useState, useEffect, useRef } from 'react';
import { supabase, postsApi, engagementApi, storageApi, statsApi } from '../services/supabaseService';
import { ICONS } from '../constants';
import type { Post, Comment } from '../types';
import matter from 'gray-matter';
import { marked } from 'marked';

// --- Types ---
type AdminTab = 'overview' | 'posts' | 'media' | 'comments';

export default function Admin() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [adminLoading, setAdminLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [view, setView] = useState<AdminTab>('overview');

    // Data State
    const [stats, setStats] = useState({ postsCount: 0, likesCount: 0, commentsCount: 0 });
    const [posts, setPosts] = useState<Post[]>([]);
    const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) loadAdminData();
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) loadAdminData();
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadAdminData = async () => {
        setAdminLoading(true);
        try {
            const [statsData, postsData] = await Promise.all([
                statsApi.getOverview(),
                postsApi.getAll()
            ]);
            setStats(statsData);
            setPosts(postsData);
        } catch (error) {
            console.error('Admin data sync failed:', error);
        } finally {
            setAdminLoading(false);
        }
    };

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
                        <h1 className="text-3xl font-bold tracking-tighter text-white">AURA ADMIN</h1>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <input type="email" placeholder="Email" className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white outline-none focus:border-white/30 transition-all" value={email} onChange={e => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Password" className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white outline-none focus:border-white/30 transition-all" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="submit" disabled={loading} className="w-full h-14 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all text-sm tracking-widest uppercase">
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (editingPost) {
        return (
            <div className="min-h-screen bg-black p-4 md:p-12">
                <PostEditor
                    post={editingPost}
                    onSave={() => { setEditingPost(null); loadAdminData(); }}
                    onCancel={() => setEditingPost(null)}
                />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black overflow-hidden font-sans">
            {/* --- Sidebar --- */}
            <aside className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col p-8 hidden lg:flex">
                <div className="mb-14">
                    <h1 className="text-2xl font-black tracking-tighter italic text-white flex items-center gap-2">
                        AURA <span className="text-[10px] text-white/20 not-italic tracking-[0.3em] font-black uppercase bg-white/5 px-2 py-1 rounded">OS V3</span>
                    </h1>
                </div>

                <nav className="flex-1 space-y-3">
                    {[
                        { id: 'overview', label: 'Overview', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
                        { id: 'posts', label: 'Content Hub', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                        { id: 'media', label: 'Media Bank', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
                        { id: 'comments', label: 'Moderate', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setView(tab.id as AdminTab)}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-500 group ${view === tab.id ? 'bg-white text-black shadow-2xl shadow-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            <svg className={`w-5 h-5 transition-transform duration-700 ${view === tab.id ? 'scale-110' : 'group-hover:translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                            </svg>
                            <span className="text-sm font-black tracking-tight">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
                    <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 text-white/20 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all group">
                        <div className="rotate-180 text-xl transition-transform group-hover:-translate-x-1">→</div>
                        <span>Back to Site</span>
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-3 text-rose-500/40 hover:text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                        <div className="text-xl">⏏</div>
                        <span>Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* --- Main Content --- */}
            <main className="flex-1 h-screen overflow-y-auto custom-scrollbar bg-[#080808] relative">
                <div className="max-w-6xl mx-auto p-8 lg:p-16">
                    {adminLoading ? (
                        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
                            <div className="w-16 h-16 border-[3px] border-white/5 border-t-white rounded-full animate-spin" />
                            <p className="text-[10px] uppercase tracking-[0.6em] font-black text-white/20 animate-pulse">Syncing Control Plane</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                            {view === 'overview' && (
                                <div className="space-y-16">
                                    <header>
                                        <h2 className="text-4xl lg:text-7xl font-black tracking-tighter text-white">Console.<br /><span className="text-white/20">Operational Pulse.</span></h2>
                                    </header>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {[
                                            { label: 'Published Stories', value: stats.postsCount, unit: 'Pieces' },
                                            { label: 'Network Appreciation', value: stats.likesCount, unit: 'Hearts' },
                                            { label: 'Reader Exchange', value: stats.commentsCount, unit: 'Comments' }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white/[0.01] border border-white/5 p-10 rounded-[3rem] hover:bg-white/[0.03] hover:border-white/10 transition-all duration-700 group">
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">{stat.label}</p>
                                                <div className="text-7xl font-black mb-2 tracking-tighter transition-transform group-hover:scale-105 origin-left">{stat.value}</div>
                                                <p className="text-[9px] text-white/10 font-black uppercase tracking-widest">{stat.unit}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-10">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-10">Recent Activity Log</h4>
                                        <div className="space-y-4">
                                            {posts.slice(0, 5).map(post => (
                                                <div key={post.id} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all cursor-pointer group" onClick={() => setView('posts')}>
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        <div>
                                                            <div className="font-bold text-base text-white/80 group-hover:text-white transition-colors">{post.title}</div>
                                                            <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-1 font-black">{post.date} · {post.category}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-white/10 text-2xl group-hover:text-white transition-all group-hover:translate-x-2">→</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {view === 'posts' && (
                                <PostManager
                                    posts={posts}
                                    onEdit={setEditingPost}
                                    onNew={() => setEditingPost({ title: '', content: '', category: 'Thought', published: false })}
                                    onRefresh={loadAdminData}
                                />
                            )}

                            {view === 'media' && <MediaCenter />}
                            {view === 'comments' && <CommentModeration />}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// --- Sub-Components ---

function PostManager({ posts, onEdit, onNew, onRefresh }: { posts: Post[], onEdit: (p: Partial<Post>) => void, onNew: () => void, onRefresh: () => void }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        try {
            setLoading(true);
            await postsApi.delete(id);
            onRefresh();
        } catch (err) {
            alert('Delete failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h2 className="text-5xl font-black tracking-tighter">Content Hub.</h2>
                    <p className="text-white/30 mt-2 font-medium uppercase text-[10px] tracking-[0.3em]">Lifecycle Management</p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        placeholder="Search posts..."
                        className="bg-white/5 border border-white/10 h-14 px-8 rounded-full outline-none focus:border-white/30 transition-all text-sm min-w-[300px]"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button onClick={onNew} className="h-14 px-10 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">New Story</button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {filteredPosts.map((post, i) => (
                    <div key={post.id} className="group flex items-center justify-between p-8 bg-white/[0.01] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.03] transition-all duration-500 hover:border-white/10 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
                        <div className="flex items-center gap-10">
                            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white/5 border border-white/5 hidden md:block">
                                {post.cover_image && <img src={post.cover_image} className="w-full h-full object-cover transition-transform group-hover:scale-110 opacity-60 group-hover:opacity-100 duration-1000" />}
                            </div>
                            <div>
                                <h4 className="text-2xl font-black tracking-tight mb-2 group-hover:text-white transition-colors">{post.title}</h4>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <span className={post.published ? 'text-emerald-500' : 'text-amber-500'}>{post.published ? 'Published' : 'Draft'}</span>
                                    <span className="text-white/10">/</span>
                                    <span className="text-white/40">{post.category}</span>
                                    <span className="text-white/10">/</span>
                                    <span className="text-white/20 font-medium lowercase tracking-normal">{post.slug}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-500">
                            <button onClick={() => onEdit(post)} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white hover:text-black transition-all group/btn">
                                <svg className="w-5 h-5 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                            <button onClick={() => handleDelete(post.id!, post.title!)} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-rose-500/20 text-white/20 hover:text-rose-500 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
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
        excerpt: post.excerpt || '',
        content: post.content || '',
        category: post.category || 'Thought',
        cover_image: post.cover_image || '',
        published: post.published ?? false
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewContent, setPreviewContent] = useState(formData.content);
    const [mediaLibrary, setMediaLibrary] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setPreviewContent(formData.content), 300);
        return () => clearTimeout(timer);
    }, [formData.content]);

    // 同步滚动核心逻辑 - 增强版比例算法
    const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (!previewRef.current || !textareaRef.current) return;

        const editor = textareaRef.current;
        const preview = previewRef.current;

        // 计算当前滚动百分比
        const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);

        // 应用于预览窗口，考虑预览窗口的实际可滚动高度
        const targetScroll = scrollPercentage * (preview.scrollHeight - preview.clientHeight);

        preview.scrollTo({
            top: targetScroll,
            behavior: 'auto' // 使用 auto 保证实时性，smooth 会产生延迟
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const { data, content } = matter(text);
            setFormData(prev => ({
                ...prev,
                title: data.title || prev.title,
                slug: data.slug || prev.slug || (data.title ? data.title.toLowerCase().replace(/ /g, '-') : ''),
                excerpt: data.excerpt || prev.excerpt,
                content: content || prev.content,
                category: data.category || prev.category,
                cover_image: data.cover_image || prev.cover_image,
                published: data.published ?? false
            }));
        };
        reader.readAsText(file);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setUploading(true);
            const url = await storageApi.uploadImage(file);
            setMediaLibrary(prev => [url, ...prev]);
            setFormData(prev => ({ ...prev, content: prev.content + `\n\n![Image](${url})` }));
        } catch (err) { alert('Upload failed'); }
        finally { setUploading(false); }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        try {
            setUploading(true);
            const url = await storageApi.uploadImage(file);
            setMediaLibrary(prev => [url, ...prev]);
            setFormData(prev => ({ ...prev, content: prev.content + `\n\n![Image](${url})` }));
        } catch (err) { alert('Drop failed'); }
        finally { setUploading(false); }
    };

    // --- Draft Persistence ---
    useEffect(() => {
        if (!post.id && formData.content) {
            localStorage.setItem('aura_draft', JSON.stringify(formData));
        }
    }, [formData]);

    useEffect(() => {
        if (!post.id) {
            const draft = localStorage.getItem('aura_draft');
            if (draft && confirm('Detected an unsaved draft. Restore it?')) {
                setFormData(JSON.parse(draft));
            }
        }
    }, []);

    const clearDraft = () => localStorage.removeItem('aura_draft');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const postData = { ...formData, html_content: marked(formData.content), reading_time: Math.ceil(formData.content.length / 500) };
            if (post.id) {
                await supabase.from('posts').update(postData).eq('id', post.id);
            } else {
                await supabase.from('posts').insert([postData]);
                clearDraft();
            }
            onSave();
        } catch (err) { alert('Save failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="max-w-[1600px] mx-auto animate-in fade-in zoom-in duration-700">
            <header className="flex items-center justify-between mb-16">
                <button onClick={onCancel} className="group flex items-center gap-3 text-white/40 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em]">
                    <div className="rotate-180 transition-transform group-hover:-translate-x-2 text-xl">→</div>
                    <span>Abandon Draft</span>
                </button>
                <div className="flex items-center gap-4">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".md" />
                    <button onClick={() => fileInputRef.current?.click()} className="h-12 px-8 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white/40 hover:text-white">Import Markdown</button>
                    <button onClick={handleSubmit} disabled={loading} className="h-12 px-12 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-white/20 shadow-2xl">
                        {loading ? 'Transmitting...' : 'Commit Story'}
                    </button>
                </div>
            </header>

            <form className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <div className="space-y-12">
                    <input
                        type="text"
                        placeholder="Project Title"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-transparent border-none text-5xl lg:text-7xl font-black tracking-tighter placeholder:text-white/5 outline-none text-white"
                    />

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">Namespace Slug</label>
                            <input type="text" placeholder="url-path" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full bg-white/[0.02] border border-white/5 rounded-3xl h-16 px-6 text-sm outline-none focus:border-white/20 transition-all text-white" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">Status Class</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-white/[0.02] border border-white/5 rounded-3xl h-16 px-6 text-sm outline-none focus:border-white/20 appearance-none text-white/60">
                                <option value="Technical">Technical</option>
                                <option value="Design">Design</option>
                                <option value="Thought">Thought</option>
                                <option value="Life">Life</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">Primary Asset (Cover)</label>
                        <div className="flex gap-4">
                            <input type="text" placeholder="External URL or Upload" value={formData.cover_image} onChange={e => setFormData({ ...formData, cover_image: e.target.value })} className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl h-16 px-6 text-sm outline-none focus:border-white/20 text-white" />
                            <input type="file" ref={imageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                            <button type="button" onClick={() => imageInputRef.current?.click()} className="w-16 h-16 flex items-center justify-center bg-white text-black rounded-3xl hover:scale-105 active:scale-95 transition-all text-2xl font-light shadow-xl">+</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">Excerpt Layer</label>
                        <textarea
                            placeholder="A brief metadata description..."
                            value={formData.excerpt}
                            onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full h-32 bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-sm outline-none focus:border-white/20 transition-all resize-none text-white/60"
                        />
                    </div>

                    <div className="space-y-4 relative">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1 flex justify-between">
                            <span>Markdown Protocol</span>
                            <span className="opacity-40 italic">Sync mode active</span>
                        </label>
                        <textarea
                            ref={textareaRef}
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            onScroll={handleEditorScroll}
                            onDragOver={e => e.preventDefault()}
                            onDrop={handleDrop}
                            className={`w-full min-h-[600px] bg-white/[0.02] border ${uploading ? 'border-sky-500' : 'border-white/5'} rounded-[3rem] p-10 text-xl font-light leading-relaxed outline-none focus:border-white/10 transition-all resize-none shadow-inner custom-scrollbar text-white/80`}
                            placeholder="Enter the flow state..."
                        />
                        {uploading && (
                            <div className="absolute inset-x-0 bottom-12 flex justify-center">
                                <div className="px-6 py-2 bg-sky-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full animate-pulse shadow-2xl">Transmitting Asset...</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden lg:block sticky top-8 h-[calc(100vh-64px)] overflow-hidden">
                    <div ref={previewRef} className="w-full h-full glass rounded-[4rem] p-16 overflow-y-auto prose prose-invert max-w-none prose-p:text-white/60 prose-headings:text-white prose-headings:tracking-tighter prose-img:rounded-[2.5rem] custom-scrollbar selection:bg-sky-500 selection:text-white">
                        <h1 className="text-5xl font-black mb-10 italic tracking-tighter text-white">{formData.title || 'Untitled Stream'}</h1>
                        <div dangerouslySetInnerHTML={{ __html: marked(previewContent) }} />
                    </div>
                </div>
            </form>
        </div>
    );
}

function MediaCenter() {
    const [media, setMedia] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        storageApi.listMedia().then(setMedia).finally(() => setLoading(false));
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Asset path copied.');
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <header>
                <h2 className="text-5xl font-black tracking-tighter">Media Bank.</h2>
                <p className="text-white/30 mt-2 font-medium uppercase text-[10px] tracking-[0.3em]">Universal Asset Repository</p>
            </header>

            {loading ? (
                <div className="py-20 text-center text-white/10 italic tracking-widest text-xs uppercase animate-pulse">Scanning buckets...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {media.map((url, i) => (
                        <div key={i} className="aspect-square bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden group relative hover:border-white/20 transition-all">
                            <img src={url} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-4 gap-2">
                                <button onClick={() => copyToClipboard(`![Asset]($\{url\})`)} className="w-full py-2 bg-white text-black text-[8px] font-black uppercase tracking-widest rounded-full">Copy MD</button>
                                <button onClick={() => window.open(url, '_blank')} className="w-full py-2 bg-white/10 text-white text-[8px] font-black uppercase tracking-widest rounded-full">Preview</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function CommentModeration() {
    const [allComments, setAllComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        setLoading(true);
        try {
            const [postComments, guestbook] = await Promise.all([
                supabase.from('comments').select('*, posts(title)').order('created_at', { ascending: false }),
                supabase.from('homepage_comments').select('*').order('created_at', { ascending: false })
            ]);

            const combined = [
                ...(postComments.data || []).map(c => ({ ...c, type: 'post', source: c.posts?.title || 'Unknown Post' })),
                ...(guestbook.data || []).map(c => ({ ...c, type: 'guestbook', source: 'Homepage Guestbook' }))
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setAllComments(combined);
        } catch (err) {
            console.error('Failed to load comments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, type: 'post' | 'guestbook') => {
        if (!confirm('Permanently delete this comment?')) return;
        try {
            const table = type === 'post' ? 'comments' : 'homepage_comments';
            await supabase.from(table).delete().eq('id', id);
            setAllComments(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            alert('Delete failed');
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-5xl font-black tracking-tighter">Governance.</h2>
                    <p className="text-white/30 mt-2 font-medium uppercase text-[10px] tracking-[0.3em]">Lifecycle Management / Discussions</p>
                </div>
                <button onClick={loadComments} className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all">
                    <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
            </header>

            {loading && allComments.length === 0 ? (
                <div className="py-20 text-center text-white/10 italic text-xs uppercase tracking-widest animate-pulse">Syncing Discussions...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {allComments.map((comment, i) => (
                        <div key={comment.id} className="group flex items-start justify-between p-8 bg-white/[0.01] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.03] transition-all duration-500 hover:border-white/10 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 30}ms` }}>
                            <div className="flex gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-white/20 text-xs">
                                    {comment.user_name?.[0] || 'A'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-white/90">{comment.user_name}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-2 py-0.5 rounded-full">{comment.type}</span>
                                    </div>
                                    <p className="text-white/40 text-sm mt-2 leading-relaxed max-w-2xl">{comment.content}</p>
                                    <div className="mt-4 text-[9px] font-black uppercase tracking-[0.1em] text-white/10">
                                        Seen on: <span className="text-white/30">{comment.source}</span> • {new Date(comment.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(comment.id, comment.type as 'post' | 'guestbook')} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-all text-white/20 hover:text-rose-500 hover:bg-rose-500/10 hover:scale-105 active:scale-95 duration-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                        </div>
                    ))}
                    {allComments.length === 0 && (
                        <div className="py-20 bg-white/[0.01] border border-white/5 rounded-[3rem] text-center italic text-white/10 text-sm">Quiet atmosphere. No discussions yet.</div>
                    )}
                </div>
            )}
        </div>
    );
}
