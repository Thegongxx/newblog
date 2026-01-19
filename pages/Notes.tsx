import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
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

    const itemVariants: Variants = {
        initial: { y: isMobile ? 8 : 16, opacity: 0 },
        animate: {
            y: 0,
            opacity: 1,
            transition: {
                type: "tween" as const,
                ease: [0.25, 0.1, 0.25, 1],
                duration: isMobile ? 0.35 : 0.45
            }
        }
    };

    const cardVariants: Variants = {
        initial: { y: isMobile ? 8 : 16, opacity: 0 },
        animate: {
            y: 0,
            opacity: 1,
            transition: {
                type: "tween" as const,
                ease: [0.25, 0.1, 0.25, 1],
                duration: isMobile ? 0.35 : 0.45
            }
        },
        hover: !isMobile ? {
            y: -10,
            rotateX: 1,
            rotateY: 0.5,
            scale: 1.015,
            transition: {
                duration: 0.6,
                ease: [0.23, 1, 0.32, 1]
            }
        } : {}
    };

    const containerVariants: Variants = {
        animate: {
            transition: {
                staggerChildren: isMobile ? 0.04 : 0.08,
                delayChildren: isMobile ? 0.08 : 0.16
            }
        }
    };

    return (
        <>
            <Helmet>
                <title>Notes · Xuan Blog</title>
                <meta name="description" content="只为引起你的共鸣。" />
            </Helmet>
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
                        只为引起你的共鸣。
                    </p>
                </motion.header>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8"
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                >
                    {loading ? (
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
                                className={`glass p-6 md:p-8 rounded-2xl md:rounded-[2.2rem] relative group border border-white/5 cursor-pointer ${isMobile
                                    ? 'active:scale-[0.98] active:bg-white/[0.02] transition-all duration-200'
                                    : 'hover:border-white/20 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500'
                                    }`}
                                variants={cardVariants}
                                initial="initial"
                                animate="animate"
                                whileHover={!isMobile ? "hover" : undefined}
                                whileTap={isMobile ? {
                                    scale: 0.98,
                                    transition: { duration: 0.1 }
                                } : undefined}
                                style={{
                                    willChange: 'transform',
                                    backfaceVisibility: 'hidden'
                                }}
                                onClick={() => navigate(`/note/${note.id}`, { state: { from: '/notes' } })}
                            >
                                {!isMobile && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/4 via-transparent to-white/8 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl md:rounded-[2.2rem]" />
                                )}

                                {isMobile && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/3 to-transparent opacity-0 group-active:opacity-100 transition-opacity duration-150 rounded-2xl pointer-events-none" />
                                )}

                                <div className={`absolute top-4 left-4 md:top-7 md:left-7 scale-75 md:scale-100 origin-top-left transition-all duration-250 ${!isMobile ? 'group-hover:scale-110 group-hover:text-white/80' : 'group-active:scale-105'
                                    }`}>
                                    {ICONS.QUOTES}
                                </div>

                                <div className="relative z-10">
                                    <h3 className={`text-lg md:text-2xl font-semibold tracking-tight text-white/90 mb-2 md:mb-3 pt-7 md:pt-9 line-clamp-2 transition-all duration-250 ${!isMobile
                                        ? 'group-hover:text-white group-hover:translate-x-2'
                                        : 'group-active:text-white/95'
                                        }`}>
                                        {note.title}
                                    </h3>
                                    <p className={`text-[13px] md:text-base font-light leading-relaxed text-white/60 mb-5 md:mb-8 line-clamp-3 md:line-clamp-4 transition-all duration-250 ${!isMobile
                                        ? 'group-hover:text-white/70'
                                        : 'group-active:text-white/70'
                                        }`}>
                                        {note.content?.length > 120 ? `${note.content.substring(0, 120)}…` : note.content}
                                    </p>
                                </div>

                                <div className={`flex items-center justify-between border-t border-white/5 pt-4 md:pt-6 relative z-10 transition-all duration-250 ${!isMobile ? 'group-hover:border-white/10' : ''
                                    }`}>
                                    <span className={`text-[10px] md:text-xs font-bold tracking-widest text-white/40 uppercase transition-all duration-300 ${!isMobile
                                        ? 'group-hover:text-white/60 group-hover:tracking-[0.2em]'
                                        : 'group-active:text-white/60'
                                        }`}>
                                        {note.date}
                                    </span>
                                    <div className="flex items-center gap-2 md:gap-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/note/${note.id}`, { state: { from: '/notes' } });
                                            }}
                                            className={`text-[10px] md:text-xs font-bold text-white/30 uppercase tracking-widest transition-all duration-300 ${!isMobile
                                                ? 'group-hover:text-white group-hover:translate-x-1'
                                                : 'active:text-white/60'
                                                }`}
                                        >
                                            详情 →
                                        </button>

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
        </>
    );
};

export default Notes;