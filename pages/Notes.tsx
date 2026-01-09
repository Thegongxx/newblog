import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LikeButton from '../components/LikeButton';
import CommentSection from '../components/CommentSection';
import { ICONS } from '../constants';

interface NotesProps {
    notes: any[];
    loading?: boolean;
}

const Notes: React.FC<NotesProps> = ({ notes, loading }) => {
    const navigate = useNavigate();
    const [expandedCommentId, setExpandedCommentId] = useState<string | null>(null);

    return (
        <div className="py-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
            <header className="mb-24">
                <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 italic">NOTES.</h2>
                <p className="text-xl text-white/30 font-light max-w-lg">那些转瞬即逝的思想，在留白间沉淀。</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {loading ? (
                    // 加载状态下的骨架屏 (Loading Skeleton)
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="glass p-10 rounded-[2.5rem] border border-white/5 animate-pulse">
                            <div className="w-8 h-8 bg-white/5 rounded mb-10" />
                            <div className="space-y-4 mb-10">
                                <div className="h-4 w-full bg-white/5 rounded" />
                                <div className="h-4 w-full bg-white/5 rounded" />
                                <div className="h-4 w-2/3 bg-white/5 rounded" />
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-8">
                                <div className="h-3 w-24 bg-white/5 rounded" />
                                <div className="h-6 w-12 bg-white/5 rounded-full" />
                            </div>
                        </div>
                    ))
                ) : notes.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-white/20 font-light border border-dashed border-white/5 rounded-[3rem]">
                        暂无笔记。在 Obsidian 的 content/notes 中写点什么吧。
                    </div>
                ) : (
                    notes.map((note, i) => (
                        <div
                            key={note.id || i}
                            className="glass p-10 rounded-[2.5rem] relative group border border-white/5 hover:border-white/20 transition-all duration-700 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="absolute top-8 left-8">{ICONS.QUOTES}</div>
                            
                            {/* 可点击的内容区域 */}
                            <div 
                                className="cursor-pointer"
                                onClick={() => navigate(`/note/${note.id}`)}
                            >
                                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white/90 mb-4 pt-10 hover:text-white transition-colors">
                                    {note.title}
                                </h3>
                                <p className="text-lg font-light leading-relaxed text-white/60 mb-10 line-clamp-3">
                                    {note.content?.substring(0, 200)}...
                                </p>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-8">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold tracking-[0.3em] text-white/40 uppercase">{note.date}</span>
                                    {note.tags && note.tags.length > 0 && (
                                        <>
                                            <span className="text-white/20">•</span>
                                            <div className="flex gap-2">
                                                {note.tags.slice(0, 2).map((tag, idx) => (
                                                    <span key={idx} className="text-xs px-2 py-1 bg-white/5 rounded-full text-white/40">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* 查看详情按钮 */}
                                    <button
                                        onClick={() => navigate(`/note/${note.id}`)}
                                        className="text-xs font-bold text-white/30 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2"
                                    >
                                        <span>详情</span>
                                        <span>→</span>
                                    </button>
                                    
                                    {/* 评论按钮 */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedCommentId(expandedCommentId === note.id ? null : note.id);
                                        }}
                                        className="text-xs font-bold text-white/30 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2"
                                    >
                                        <span>评论</span>
                                        <div className={`transition-transform duration-300 ${expandedCommentId === note.id ? 'rotate-180' : ''}`}>↓</div>
                                    </button>
                                    
                                    <LikeButton 
                                        targetType="note" 
                                        targetId={note.id} 
                                        initialCount={0}
                                        className="scale-75 origin-right !bg-transparent !border-none !px-0" 
                                    />
                                </div>
                            </div>

                            {expandedCommentId === note.id && (
                                <div className="mt-8 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-top-4">
                                    <CommentSection targetId={note.id} targetType="note" />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notes;