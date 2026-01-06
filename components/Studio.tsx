
import React, { useState } from 'react';
import { Post } from '../types';

interface StudioProps {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  onBack: () => void;
}

const Studio: React.FC<StudioProps> = ({ posts, setPosts, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Post>>({});

  const handleSave = () => {
    if (!formData.title || !formData.content) return;

    const newPost: Post = {
      id: formData.id || Date.now().toString(),
      title: formData.title,
      excerpt: formData.excerpt || '',
      category: formData.category || 'Uncategorized',
      date: formData.date || new Date().toLocaleDateString(),
      readingTime: formData.readingTime || '5 min',
      image: formData.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
      content: formData.content
    };

    if (formData.id) {
       setPosts(posts.map(p => p.id === formData.id ? newPost : p));
    } else {
       setPosts([newPost, ...posts]);
    }
    setIsEditing(false);
    setFormData({});
  };

  const handleEdit = (post: Post) => {
    setFormData(post);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  return (
    <div className="py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-4xl font-bold tracking-tighter">Studio.</h2>
        <div className="flex gap-4">
             <button onClick={onBack} className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-all text-sm font-bold tracking-widest uppercase">
            Exit
          </button>
          {!isEditing && (
             <button onClick={() => { setFormData({}); setIsEditing(true); }} className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 transition-all text-white text-sm font-bold tracking-widest uppercase shadow-lg shadow-blue-900/50">
                New Post
             </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="glass p-8 rounded-[2.5rem] border border-white/10">
          <div className="space-y-6">
             <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Title</label>
                <input 
                  value={formData.title || ''} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all"
                  placeholder="Enter post title..."
                />
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Category</label>
                    <input 
                      value={formData.category || ''} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all"
                      placeholder="Design, Tech..."
                    />
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Image URL</label>
                    <input 
                      value={formData.image || ''} 
                      onChange={e => setFormData({...formData, image: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all"
                      placeholder="https://..."
                    />
                </div>
             </div>

             <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Excerpt</label>
                <textarea 
                  value={formData.excerpt || ''} 
                  onChange={e => setFormData({...formData, excerpt: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all h-20"
                  placeholder="Short summary..."
                />
             </div>

             <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Content (HTML)</label>
                <textarea 
                  value={formData.content || ''} 
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all h-64 font-mono text-sm"
                  placeholder="<p>Write your content here...</p>"
                />
             </div>

             <div className="flex justify-end gap-4 pt-4">
                <button onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-xl hover:bg-white/10 transition-all text-sm font-medium">Cancel</button>
                <button onClick={handleSave} className="px-8 py-2 rounded-xl bg-white text-black font-bold hover:scale-105 active:scale-95 transition-all">Save Changes</button>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
             <div key={post.id} className="glass p-6 rounded-[2rem] flex items-center justify-between group border border-white/5 hover:border-white/20 transition-all">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5">
                        <img src={post.image} className="w-full h-full object-cover opacity-80" alt="" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-1">{post.title}</h3>
                        <div className="flex gap-3 text-xs text-white/40 uppercase tracking-wider">
                            <span>{post.date}</span>
                            <span>•</span>
                            <span>{post.category}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(post)} className="p-3 rounded-full hover:bg-white/10 transition-all" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="p-3 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-all" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Studio;
