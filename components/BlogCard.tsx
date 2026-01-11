import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Post } from '../types';
import LikeButton from './LikeButton';
import { useIsMobile } from '../hooks/useResponsive';
import { TiltCard, GlowHover } from './HoverEffects';

interface BlogCardProps {
  post: Post;
  onClick: () => void;
  featured?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = memo(({ post, onClick, featured }) => {
  const isMobile = useIsMobile();

  // 移动端极简版本
  if (isMobile) {
    return (
      <motion.div
        className="bg-white/[0.02] border border-white/5 rounded-lg p-4 space-y-3 active:bg-white/[0.04] transition-colors ripple-effect"
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-wide">
          <span>{post.category}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>{post.date}</span>
        </div>
        <h3 className="text-base font-semibold text-white leading-snug line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-white/60 leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] text-white/30 uppercase tracking-wide">
            {post.readingTime}
          </span>
          <div onClick={(e) => e.stopPropagation()}>
            <LikeButton
              targetType="post"
              targetId={post.id}
              initialCount={post.likes_count || 0}
              className="!bg-transparent !border-none !px-2 !py-1 scale-90"
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // 桌面端完整版本
  return (
    <TiltCard
      className={`group relative ${featured ? 'h-[380px]' : 'h-[320px]'} cursor-pointer`}
      maxTilt={8}
    >
      <GlowHover
        className={`w-full h-full bg-white/[0.03] backdrop-blur-3xl rounded-2xl transition-all duration-300 hover:bg-white/[0.05] floating-shadow`}
        glowColor="#ffffff"
        intensity={0.1}
      >
        <motion.div
          className="relative w-full h-full"
          onClick={onClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          style={{ 
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
          }}
        >
          {/* 全幅封面图容器 - 优化图片加载 */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <motion.img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 opacity-60 group-hover:opacity-80"
              loading="lazy"
              decoding="async"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                willChange: 'transform',
                backfaceVisibility: 'hidden'
              }}
            />
            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* 悬停时的光晕效果 */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* 分类标签 */}
          <motion.div 
            className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider z-20 magnetic-hover"
            whileHover={{ scale: 1.1, y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {post.category}
          </motion.div>

          {/* 内容区域 */}
          <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end z-20">
            <motion.div 
              className="flex items-center gap-2 mb-2 text-white/50 text-[9px] font-medium uppercase tracking-wider"
              initial={{ opacity: 0.7 }}
              whileHover={{ opacity: 1 }}
            >
              <span>{post.date}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-white/30" />
              <span>{post.readingTime}</span>
            </motion.div>

            <motion.h3 
              className={`${featured ? 'text-2xl' : 'text-xl'} font-bold text-white tracking-tight leading-snug line-clamp-2`}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {post.title}
            </motion.h3>

            {/* 桌面端显示摘要 */}
            <motion.p 
              className="mt-2 text-white/50 text-sm font-light leading-relaxed line-clamp-1"
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {post.excerpt}
            </motion.p>
          </div>

          {/* 悬停时的装饰元素 */}
          <motion.div
            className="absolute top-4 right-4 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover:opacity-100"
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 25 }}
          />
        </motion.div>
      </GlowHover>
    </TiltCard>
  );
});

BlogCard.displayName = 'BlogCard';

export default BlogCard;
