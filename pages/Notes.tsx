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
        initial: { y: isMobile ? 10 : 20, opacity: 0 },
        animate: { 
            y: 0,
            opacity: 1,
            transition: { 
                type: "tween",
                ease: [0.25, 0.1, 0.25, 1],
                duration: isMobile ? 0.4 : 0.6
            }
        }
    };

    const containerVariants = {
        animate: {
            transition: {
                staggerChildren: isMobile ? 0.05 : 0.1,
                delayChildren: isMobile ? 0.1 : 0.2
            }
        }
    };

    return (
        <div className="py-8 md:py-12">
            <motion.header 
                className="mb-12 md:mb-24" 
                variants={itemVariants}
                initial="initial"
                animate="animate"
            >
                <h2 className="text-4xl md:text-8xl font-bold tracking-tighter mb-4 md:mb-8 italic">NOTES.</h2>
                <p className="text-base md:text-xl text-white/30 font-light max-w-lg">那些转瞬即逝的思想，在留白间沉淀。</p>
            </motion.header>

            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8" 
                variants={containerVariants}
                initial="initial"
                animate="animate"
            >
                {loading ? (
                    // 加载状态下的骨架屏 - 移动端简化
                    Array.from({ length: 2 }).map((_, i) => (
                        <motion.div 
                            key={i} 
                            className="glass p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-white/5 animate-pulse"
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
                        className="col-span-full py-12 md:py-20 text-center text-white/20 font-light border border-dashed border-white/5 rounded-2xl md:rounded-[3rem]"
                        variants={itemVariants}
                    >
                        暂无笔记
                    </motion.div>
                ) : (
                    notes.map((note, i) => (
                        <motion.div
                            key={note.id || i}
                            className={`glass p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] relative group border border-white/5 cursor-pointer ${
                                isMobile 
                                    ? 'active:scale-[0.98] active:bg-white/[0.02] transition-all duration-200' 
                                    : 'hover:border-white/20 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500'
                            }`}
                            variants={itemVariants}
                            style={{
                                willChange: 'transform',
                                backfaceVisibility: 'hidden'
                            }}
                            onClick={() => navigate(`/note/${note.id}`)}
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
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl md:rounded-[2.5rem]" />
                            )}
                            
                            {/* 移动端专属：点击时的涟漪效果 */}
                            {isMobile && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/3 to-transparent opacity-0 group-active:opacity-100 transition-opacity duration-200 rounded-2xl pointer-events-none" />
                            )}

                            <div className={`absolute top-4 left-4 md:top-8 md:left-8 scale-75 md:scale-100 origin-top-left transition-all duration-300 ${
                                !isMobile ? 'group-hover:scale-110 group-hover:text-white/80' : 'group-active:scale-105'
                            }`}>
                                {ICONS.QUOTES}
                            </div>
                            
                            {/* 内容区域 */}
                            <div className="relative z-10">
                                <h3 className={`text-xl md:text-3xl font-bold tracking-tight text-white/90 mb-3 md:mb-4 pt-8 md:pt-10 line-clamp-2 transition-all duration-300 ${
                                    !isMobile 
                                        ? 'group-hover:text-white group-hover:translate-x-2' 
                                        : 'group-active:text-white/95'
                                }`}>
                                    {note.title}
                                </h3>
                                <p className={`text-sm md:text-lg font-light leading-relaxed text-white/60 mb-6 md:mb-10 line-clamp-2 md:line-clamp-3 transition-all duration-300 ${
                                    !isMobile 
                                        ? 'group-hover:text-white/70' 
                                        : 'group-active:text-white/70'
                                }`}>
                                    {note.content?.substring(0, 150)}...
                                </p>
                            </div>

                            {/* 底部信息 */}
                            <div className={`flex items-center justify-between border-t border-white/5 pt-4 md:pt-8 relative z-10 transition-all duration-300 ${
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
                                            navigate(`/note/${note.id}`);
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