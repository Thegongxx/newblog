import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LikeButton from '../components/LikeButton';
import CommentSection from '../components/CommentSection';
import { ICONS } from '../constants';

interface NotesProps {
    notes: any[];
    loading?: boolean;
}

// 统一动画配置
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const Notes: React.FC<NotesProps> = ({ notes, loading }) => {
    const navigate = useNavigate();
    const [expandedCommentId, setExpandedCommentId] = useState<string | null>(null);

    return (
        <motion.div 
            className="py-8 md:py-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.header className="mb-12 md:mb-24" variants={itemVariants}>
                <h2 className="text-4xl md:text-8xl font-bold tracking-tighter mb-4 md:mb-8 italic">NOTES.</h2>
                <p className="text-base md:text-xl text-white/30 font-light max-w-lg">那些转瞬即逝的思想，在留白间沉淀。</p>
            </motion.header>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8" variants={itemVariants}>
                {loading ? (
                    // 加载状态下的骨架屏 - 移动端简化
                    Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="glass p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-white/5 animate-pulse">
                            <div className="w-6 h-6 bg-white/5 rounded mb-6" />
                            <div className="space-y-3 mb-6">
                                <div className="h-4 w-full bg-white/5 rounded" />
                                <div className="h-4 w-2/3 bg-white/5 rounded" />
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-4">
                                <div className="h-3 w-20 bg-white/5 rounded" />
                            </div>
                        </div>
                    ))
                ) : notes.length === 0 ? (
                    <div className="col-span-full py-12 md:py-20 text-center text-white/20 font-light border border-dashed border-white/5 rounded-2xl md:rounded-[3rem]">
                        暂无笔记
                    </div>
                ) : (
                    notes.map((note, i) => (
                        <motion.div
                            key={note.id || i}
                            className="glass p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] relative group border border-white/5 hover:border-white/20 transition-all duration-500"
                            variants={itemVariants}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        >
                            <div className="absolute top-4 left-4 md:top-8 md:left-8 scale-75 md:scale-100 origin-top-left">{ICONS.QUOTES}</div>
                            
                            {/* 可点击的内容区域 */}
                            <div 
                                className="cursor-pointer"
                                onClick={() => navigate(`/note/${note.id}`)}
                            >
                                <h3 className="text-xl md:text-3xl font-bold tracking-tight text-white/90 mb-3 md:mb-4 pt-8 md:pt-10 hover:text-white transition-colors line-clamp-2">
                                    {note.title}
                                </h3>
                                <p className="text-sm md:text-lg font-light leading-relaxed text-white/60 mb-6 md:mb-10 line-clamp-2 md:line-clamp-3">
                                    {note.content?.substring(0, 150)}...
                                </p>
                            </div>

                            {/* 底部信息 - 移动端简化 */}
                            <div className="flex items-center justify-between border-t border-white/5 pt-4 md:pt-8">
                                <span className="text-[10px] md:text-xs font-bold tracking-widest text-white/40 uppercase">{note.date}</span>
                                <div className="flex items-center gap-2 md:gap-4">
                                    {/* 移动端只显示详情按钮 */}
                                    <button
                                        onClick={() => navigate(`/note/${note.id}`)}
                                        className="text-[10px] md:text-xs font-bold text-white/30 hover:text-white uppercase tracking-widest transition-colors"
                                    >
                                        详情 →
                                    </button>
                                    
                                    {/* 评论按钮 - 移动端隐藏 */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedCommentId(expandedCommentId === note.id ? null : note.id);
                                        }}
                                        className="hidden md:flex text-xs font-bold text-white/30 hover:text-white uppercase tracking-widest transition-colors items-center gap-2"
                                    >
                                        <span>评论</span>
                                        <div className={`transition-transform duration-300 ${expandedCommentId === note.id ? 'rotate-180' : ''}`}>↓</div>
                                    </button>
                                    
                                    <LikeButton 
                                        targetType="note" 
                                        targetId={note.id} 
                                        initialCount={0}
                                        className="scale-75 md:scale-75 origin-right !bg-transparent !border-none !px-0" 
                                    />
                                </div>
                            </div>

                            {/* 评论区 - 仅桌面端展开 */}
                            {expandedCommentId === note.id && (
                                <div className="hidden md:block mt-8 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-top-4">
                                    <CommentSection targetId={note.id} targetType="note" />
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </motion.div>
        </motion.div>
    );
};

export default Notes;