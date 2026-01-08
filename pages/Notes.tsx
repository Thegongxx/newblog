import React from 'react';
import { Helmet } from 'react-helmet-async';
import LikeButton from '../components/LikeButton';
import { ICONS } from '../constants';

interface NotesProps {
    notes: any[];
    loading?: boolean;
}

const Notes: React.FC<NotesProps> = ({ notes, loading }) => {
    return (
        <div className="py-12">
            <Helmet>
                <title>Notes | Aura</title>
                <meta name="description" content="那些转瞬即逝的思想，在留白间沉淀。" />
            </Helmet>

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
                    notes.map((quote, i) => (
                        <div
                            key={quote.id || i}
                            className="glass p-10 rounded-[2.5rem] relative group border border-white/5 hover:border-white/20 transition-all duration-700 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="absolute top-8 left-8">{ICONS.QUOTES}</div>
                            <p className="text-xl md:text-2xl font-light leading-relaxed text-white/80 mb-10 pt-10">“{quote.text}”</p>
                            <div className="flex items-center justify-between border-t border-white/5 pt-8">
                                <span className="text-xs font-bold tracking-[0.3em] text-white/40 uppercase">— {quote.author}</span>
                                <LikeButton targetType="note" targetId={quote.id} initialCount={quote.likes_count} className="scale-75 origin-right !bg-transparent !border-none !px-0" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notes;
