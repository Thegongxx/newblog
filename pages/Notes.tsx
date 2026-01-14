import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LikeButton from '../components/LikeButton';
import { ICONS } from '../constants';
import { useIsMobile } from '../hooks/useResponsive';

interface NotesProps {
    notes: any[];
    loading?: boolean;
}

const Notes: React.FC<NotesProps> = ({ notes, loading }) => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    // 移除页面级动画，让PageTransition处理
    const itemVariants = {
        initial: { y: isMobile ? 8 : 16, opacity: 0 },
        animate: { 
            y: 0,
            opacity: 1,
            transition: { 
                type: "tween",
                ease: [0.25, 0.1, 0.25, 1],
                duration: isMobile ? 0.35 : 0.45
            }
        }
    };

    const containerVariants = {
        animate: {
            transition: {
                staggerChildren: isMobile ? 0.04 : 0.08,
                delayChildren: isMobile ? 0.08 : 0.16
            }
        }
    };

    return (
        <div className="py-8 md:py-12">
            <motion.header 
                className="mb-10 md:mb-20" 
                variants={itemVariants}
                initial="initial"
                animate="animate"
            >
                <h2 className="text-3xl md:text-7xl font-bold tracking-tight mb-3 md:mb-6">
                    Notes
                </h2>
                <p className="text-sm md:text-lg text-white/35 font-light max-w-lg">
                    那些转瞬即逝的想法，在安静的留白里慢慢沉淀。
                </p>
            </motion.header>

            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8" 
                variants={containerVariants}
                initial="initial"
                animate="animate"
            >
                {loading ? (
                    // 加载状态下的骨架屏
                    Array.from({ length: 2 }).map((_, i) => (
                        <motion.div 
                            key={i} 
                            className="glass p-6 md:p-8 rounded-2xl md:rounded-[2.2rem] border border-white/5 animate-pulse"
                            variants={itemVariants}
                        >
                            <div className="w-6 h-6 bg-white/5 rounded mb-6" />
                            <div className="space-y-3 mb-6">
                                <div className="h-4 w-full bg-white/5 rounded" />
                                <div className="h-4 w-2/3 bg-white/5 rounded" />
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-4">
                                <div className="h-3 w-20 bg-white/5 rounded" />
                            </div>
                        </motion.div>
                    ))
                ) : notes.length === 0 ? (
                    <motion.div 
                        className="col-span-full py-10 md:py-18 text-center text-white/22 font-light border border-dashed border-white/5 rounded-2xl md:rounded-[2.5rem]"
                        variants={itemVariants}
                    >
                        暂无笔记
                    </motion.div>
                ) : (
                    notes.map((note, i) => (
                        <motion.div
                            key={note.id || i}
                            className={`glass p-6 md:p-8 rounded-2xl md:rounded-[2.2rem] relative group border border-white/5 cursor-pointer ${
                                isMobile 
                                    ? 'active:scale-[0.98] active:bg-white/[0.02] transition-all duration-200' 
                                    : 'hover:border-white/20 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500'
                            }`}
                            variants={itemVariants}
                            style={{
                                willChange: 'transform',
                                backfaceVisibility: 'hidden'
                            }}
                            onClick={() => navigate(`/note/${note.id}`, { state: { from: '/notes' } })}
                            // 桌面端专属：纸张翻页效果
                            whileHover={!isMobile ? {
                                y: -8,
                                rotateX: 2,
                                rotateY: 1,
                                scale: 1.02,
                                transition: { 
                                    type: "spring", 
                                    stiffness: 300, 
                                    damping: 30 
                                }
                            } : {}}
                            whileTap={isMobile ? {
                                scale: 0.98,
                                transition: { duration: 0.1 }
                            } : {}}
                        >
                            {/* 桌面端专属：悬停时的纸张阴影效果 */}
                            {!isMobile && (
                                <div className="absolute inset-0 bg-gradient-to-br from-white/4 via-transparent to-white/8 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl md:rounded-[2.2rem]" />
                            )}
                            
                            {/* 移动端专属：点击时的涟漪效果 */}
                            {isMobile && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/3 to-transparent opacity-0 group-active:opacity-100 transition-opacity duration-150 rounded-2xl pointer-events-none" />
                            )}

                            <div className={`absolute top-4 left-4 md:top-7 md:left-7 scale-75 md:scale-100 origin-top-left transition-all duration-250 ${
                                !isMobile ? 'group-hover:scale-110 group-hover:text-white/80' : 'group-active:scale-105'
                            }`}>
                                {ICONS.QUOTES}
                            </div>
                            
                            {/* 内容区域 */}
                            <div className="relative z-10">
                                <h3 className={`text-lg md:text-2xl font-semibold tracking-tight text-white/90 mb-2 md:mb-3 pt-7 md:pt-9 line-clamp-2 transition-all duration-250 ${
                                    !isMobile 
                                        ? 'group-hover:text-white group-hover:translate-x-2' 
                                        : 'group-active:text-white/95'
                                }`}>
                                    {note.title}
                                </h3>
                                <p className={`text-[13px] md:text-base font-light leading-relaxed text-white/60 mb-5 md:mb-8 line-clamp-3 md:line-clamp-4 transition-all duration-250 ${
                                    !isMobile 
                                        ? 'group-hover:text-white/70' 
                                        : 'group-active:text-white/70'
                                }`}>
                                    {note.content?.length > 120 ? `${note.content.substring(0, 120)}…` : note.content}
                                </p>
                            </div>

                            {/* 底部信息 */}
                            <div className={`flex items-center justify-between border-t border-white/5 pt-4 md:pt-6 relative z-10 transition-all duration-250 ${
                                !isMobile ? 'group-hover:border-white/10' : ''
                            }`}>
                                <span className={`text-[10px] md:text-xs font-bold tracking-widest text-white/40 uppercase transition-all duration-300 ${
                                    !isMobile 
                                        ? 'group-hover:text-white/60 group-hover:tracking-[0.2em]' 
                                        : 'group-active:text-white/60'
                                }`}>
                                    {note.date}
                                </span>
                                <div className="flex items-center gap-2 md:gap-4">
                                    {/* 详情按钮 */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/note/${note.id}`, { state: { from: '/notes' } });
                                        }}
                                        className={`text-[10px] md:text-xs font-bold text-white/30 uppercase tracking-widest transition-all duration-300 ${
                                            !isMobile 
                                                ? 'group-hover:text-white group-hover:translate-x-1' 
                                                : 'active:text-white/60'
                                        }`}
                                    >
                                        详情 →
                                    </button>
                                    
                                    {/* 点赞按钮 */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <LikeButton 
                                            key={`note-${note.id}-like`}
                                            targetType="note" 
                                            targetId={note.id} 
                                            initialCount={note.likes_count || 0}
                                            className="!bg-transparent !border-none" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </div>
    );
};

export default Notes;