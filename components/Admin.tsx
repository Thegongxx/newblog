import React, { useState, useEffect } from 'react';
import { supabase, postsApi, notesApi, storageApi, statsApi } from '../services/supabaseService';
import { ICONS } from '../constants';
import type { Post } from '../types';

// --- Types ---
type AdminTab = 'overview' | 'posts' | 'notes' | 'media' | 'comments';

export default function Admin() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [adminLoading, setAdminLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [view, setView] = useState<AdminTab>('overview');

    // Data State
    const [stats, setStats] = useState({ postsCount: 0, notesCount: 0, likesCount: 0, commentsCount: 0 });
    const [posts, setPosts] = useState<Post[]>([]);
    const [notes, setNotes] = useState<any[]>([]);

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
            const [statsData, postsData, notesData] = await Promise.all([
                statsApi.getOverview(),
                postsApi.getAll(),
                notesApi.getAll()
            ]);
            setStats({ ...statsData, notesCount: notesData.length });
            setPosts(postsData);
            setNotes(notesData);
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
                        <p className="text-[10px] text-white/20 mt-2 uppercase tracking-[0.2em]">File-Driven Control Plane</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <input type="email" placeholder="Email" className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white outline-none focus:border-white/30 transition-all font-mono" value={email} onChange={e => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Password" className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white outline-none focus:border-white/30 transition-all font-mono" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="submit" disabled={loading} className="w-full h-14 bg-white text-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all text-[10px] tracking-widest uppercase">
                            {loading ? 'Authenticating...' : 'Establish Session'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black overflow-hidden font-sans">
            {/* --- Sidebar --- */}
            <aside className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col p-8 hidden lg:flex">
                <div className="mb-14">
                    <h1 className="text-2xl font-black tracking-tighter italic text-white flex items-center gap-2">
                        AURA <span className="text-[10px] text-white/20 not-italic tracking-[0.3em] font-black uppercase bg-white/5 px-2 py-1 rounded">V3.FLAT</span>
                    </h1>
                </div>

                <nav className="flex-1 space-y-3">
                    {[
                        { id: 'overview', label: 'Monitor', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
                        { id: 'posts', label: 'Vault Status', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                        { id: 'notes', label: 'Notes Archive', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
                        { id: 'media', label: 'Media Assets', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
                        { id: 'comments', label: 'Governance', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' }
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
                        <span>Explore Site</span>
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-3 text-rose-500/40 hover:text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                        <div className="text-xl">⏏</div>
                        <span>Purge Creds</span>
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
                                        <h2 className="text-4xl lg:text-7xl font-black tracking-tighter text-white">System.<br /><span className="text-white/20">File-First Mode.</span></h2>
                                        <p className="text-white/30 mt-6 text-sm font-light leading-loose max-w-xl">
                                            Online editor has been deprecated. Writing is now handled via local Markdown files in <code className="bg-white/5 px-2 py-0.5 rounded text-white/60">content/posts</code>. Run <code className="bg-white/5 px-2 py-0.5 rounded text-white/60">npm run sync</code> to update the Cloud database.
                                        </p>
                                    </header>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                        {[
                                            { label: 'Cloud Objects', value: stats.postsCount, unit: 'Posts' },
                                            { label: 'Note Archive', value: stats.notesCount, unit: 'Notes' },
                                            { label: 'Engagement', value: stats.likesCount, unit: 'Hearts' },
                                            { label: 'Exchanges', value: stats.commentsCount, unit: 'Units' }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white/[0.01] border border-white/5 p-10 rounded-[3rem] hover:bg-white/[0.03] hover:border-white/10 transition-all duration-700 group">
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">{stat.label}</p>
                                                <div className="text-7xl font-black mb-2 tracking-tighter transition-transform group-hover:scale-105 origin-left">{stat.value}</div>
                                                <p className="text-[9px] text-white/10 font-black uppercase tracking-widest">{stat.unit}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-10">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-10">Live Database Mirror</h4>
                                        <div className="space-y-4">
                                            {posts.slice(0, 5).map(post => (
                                                <div key={post.id} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                                                        <div>
                                                            <div className="font-bold text-base text-white/80">{post.title}</div>
                                                            <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-1 font-black">{post.date} · {post.category}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em]">Live</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {view === 'posts' && (
                                <PostManager posts={posts} onRefresh={loadAdminData} />
                            )}

                            {view === 'notes' && (
                                <NotesManager notes={notes} onRefresh={loadAdminData} />
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

function PostManager({ posts, onRefresh }: { posts: Post[], onRefresh: () => void }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Permanently delete "${title}"? This will only remove the Database entry.`)) return;
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
                    <h2 className="text-5xl font-black tracking-tighter">Vault Status.</h2>
                    <p className="text-white/30 mt-2 font-medium uppercase text-[10px] tracking-[0.3em]">Synchornized Objects</p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        placeholder="Scan for objects..."
                        className="bg-white/5 border border-white/10 h-14 px-8 rounded-full outline-none focus:border-white/30 transition-all text-sm min-w-[300px] font-mono"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {filteredPosts.map((post, i) => (
                    <div key={post.id} className="group flex items-center justify-between p-8 bg-white/[0.01] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.03] transition-all duration-500 hover:border-white/10 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
                        <div className="flex items-center gap-10">
                            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white/5 border border-white/5 hidden md:block">
                                {post.cover_image && <img src={post.cover_image} className="w-full h-full object-cover transition-transform group-hover:scale-110 opacity-60 duration-1000" />}
                            </div>
                            <div>
                                <h4 className="text-2xl font-black tracking-tight mb-2 text-white/90">{post.title}</h4>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <span className="text-sky-500">Synced</span>
                                    <span className="text-white/10">/</span>
                                    <span className="text-white/40">{post.category}</span>
                                    <span className="text-white/10">/</span>
                                    <span className="text-white/20 font-mono lowercase tracking-normal">{post.slug}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-500">
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

function MediaCenter() {
    const [media, setMedia] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        storageApi.listMedia().then(setMedia).finally(() => setLoading(false));
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Public asset path copied.');
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <header>
                <h2 className="text-5xl font-black tracking-tighter">Media Assets.</h2>
                <p className="text-white/30 mt-2 font-medium uppercase text-[10px] tracking-[0.3em]">External Object Registry</p>
            </header>

            {loading ? (
                <div className="py-20 text-center text-white/10 italic tracking-widest text-xs uppercase animate-pulse">Mapping bucket address space...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {media.map((url, i) => (
                        <div key={i} className="aspect-square bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden group relative hover:border-white/20 transition-all">
                            <img src={url} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-4 gap-2">
                                <button onClick={() => copyToClipboard(`![Asset]($\{url\})`)} className="w-full py-2 bg-white text-black text-[8px] font-black uppercase tracking-widest rounded-full">Copy Link</button>
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
            const [postComments, noteComments, homepageComments] = await Promise.all([
                supabase.from('post_comments').select('*, posts(title)').order('created_at', { ascending: false }),
                supabase.from('note_comments').select('*, notes(title)').order('created_at', { ascending: false }),
                supabase.from('homepage_comments').select('*').order('created_at', { ascending: false })
            ]);

            const combined = [
                ...(postComments.data || []).map(c => ({ 
                    ...c, 
                    type: 'post', 
                    source: c.posts?.title || 'Unknown Post',
                    user_name: c.author // 统一字段名
                })),
                ...(noteComments.data || []).map(c => ({ 
                    ...c, 
                    type: 'note', 
                    source: c.notes?.title || 'Unknown Note',
                    user_name: c.author // 统一字段名
                })),
                ...(homepageComments.data || []).map(c => ({ 
                    ...c, 
                    type: 'homepage', 
                    source: 'Homepage Guestbook',
                    user_name: c.author // 统一字段名
                }))
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setAllComments(combined);
        } catch (err) {
            console.error('Failed to load comments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, type: 'post' | 'note' | 'homepage') => {
        if (!confirm('Permanently purge this discussion branch?')) return;
        try {
            let table;
            switch (type) {
                case 'post':
                    table = 'post_comments';
                    break;
                case 'note':
                    table = 'note_comments';
                    break;
                case 'homepage':
                    table = 'homepage_comments';
                    break;
                default:
                    throw new Error('Unknown comment type');
            }
            
            await supabase.from(table).delete().eq('id', id);
            setAllComments(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Purge failed');
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-5xl font-black tracking-tighter">Governance.</h2>
                    <p className="text-white/30 mt-2 font-medium uppercase text-[10px] tracking-[0.3em]">Discussion Lifecycle Control</p>
                </div>
                <button onClick={loadComments} className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all">
                    <svg className={`w-5 h-5 $\{loading ? 'animate-spin' : ''\}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
            </header>

            {loading && allComments.length === 0 ? (
                <div className="py-20 text-center text-white/10 italic text-xs uppercase tracking-widest animate-pulse">Gathering Exchange Nodes...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {allComments.map((comment, i) => (
                        <div key={comment.id} className="group flex items-start justify-between p-8 bg-white/[0.01] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.03] transition-all duration-500 hover:border-white/10 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 30}ms` }}>
                            <div className="flex gap-6">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-rose-500/60 text-[10px] border border-white/5">
                                    {comment.user_name?.[0]?.toUpperCase() || 'A'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-white/90 text-sm">{comment.user_name}</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">{comment.type}</span>
                                    </div>
                                    <p className="text-white/40 text-[13px] mt-2 leading-relaxed max-w-2xl font-light">{comment.content}</p>
                                    <div className="mt-4 text-[8px] font-black uppercase tracking-[0.1em] text-white/10">
                                        Source: <span className="text-white/30">{comment.source}</span> • {new Date(comment.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(comment.id, comment.type as 'post' | 'note' | 'homepage')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-all text-white/20 hover:text-rose-500 hover:bg-rose-500/10 duration-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
function NotesManager({ notes, onRefresh }: { notes: any[], onRefresh: () => void }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const filteredNotes = notes.filter(n => n.author?.toLowerCase().includes(searchTerm.toLowerCase()) || n.text?.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleDelete = async (id: string, author: string) => {
        if (!confirm(`Permanently delete note "${author}"? This will only remove the Database entry.`)) return;
        try {
            setLoading(true);
            await notesApi.delete(id);
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
                    <h2 className="text-5xl font-black tracking-tighter">Notes Archive.</h2>
                    <p className="text-white/30 mt-2 font-medium uppercase text-[10px] tracking-[0.3em]">Thought Fragments</p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        placeholder="Search notes..."
                        className="bg-white/5 border border-white/10 h-14 px-8 rounded-full outline-none focus:border-white/30 transition-all text-sm min-w-[300px] font-mono"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {filteredNotes.map((note, i) => (
                    <div key={note.id} className="group flex items-center justify-between p-8 bg-white/[0.01] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.03] transition-all duration-500 hover:border-white/10 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
                        <div className="flex items-center gap-10">
                            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white/5 border border-white/5 hidden md:flex items-center justify-center">
                                <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-2xl font-black tracking-tight mb-2 text-white/90">{note.author || 'Untitled Note'}</h4>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                                    <span className="text-amber-500">Note</span>
                                    <span className="text-white/10">/</span>
                                    <span className="text-white/40">{note.tags?.[0] || 'Uncategorized'}</span>
                                    <span className="text-white/10">/</span>
                                    <span className="text-white/20 font-mono lowercase tracking-normal">{new Date(note.created_at).toLocaleDateString()}</span>
                                </div>
                                {note.text && (
                                    <p className="text-white/40 text-sm leading-relaxed max-w-2xl line-clamp-2">
                                        {note.text.substring(0, 150)}...
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-500">
                            <button onClick={() => handleDelete(note.id!, note.author || 'Untitled')} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-rose-500/20 text-white/20 hover:text-rose-500 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
                
                {filteredNotes.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <p className="text-white/20 text-sm font-medium">
                            {searchTerm ? 'No notes match your search' : 'No notes found in archive'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}