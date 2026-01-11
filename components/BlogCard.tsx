import React, { memo } from 'react';
import { Post } from '../types';
import LikeButton from './LikeButton';
import { useIsMobile } from '../hooks/useResponsive';

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
      <div
        className="bg-white/[0.02] border border-white/5 rounded-lg p-4 space-y-3 active:bg-white/[0.04] transition-colors"
        onClick={onClick}
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
      </div>
    );
  }

  // 桌面端完整版本
  return (
    <div
      className={`group relative ${featured ? 'h-[380px]' : 'h-[320px]'} bg-white/[0.03] backdrop-blur-3xl rounded-2xl transition-all duration-300 hover:bg-white/[0.05] cursor-pointer overflow-hidden`}
      onClick={onClick}
      style={{ 
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)'
      }}
    >
      {/* 全幅封面图容器 - 优化图片加载 */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02] grayscale-[0.1] group-hover:grayscale-0 opacity-60 group-hover:opacity-80"
          loading="lazy"
          decoding="async"
          style={{
            willChange: 'transform',
            backfaceVisibility: 'hidden'
          }}
        />
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* 分类标签 */}
      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider z-20">
        {post.category}
      </div>

      {/* 点赞按钮 */}
      <div className="absolute top-4 right-4 z-30" onClick={(e) => e.stopPropagation()}>
        <LikeButton
          targetType="post"
          targetId={post.id}
          initialCount={post.likes_count}
          className="!bg-white/10 !backdrop-blur-xl"
        />
      </div>

      {/* 内容区域 */}
      <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end z-20">
        <div className="flex items-center gap-2 mb-2 text-white/50 text-[9px] font-medium uppercase tracking-wider">
          <span>{post.date}</span>
          <span className="w-0.5 h-0.5 rounded-full bg-white/30" />
          <span>{post.readingTime}</span>
        </div>

        <h3 className={`${featured ? 'text-2xl' : 'text-xl'} font-bold text-white tracking-tight leading-snug line-clamp-2`}>
          {post.title}
        </h3>

        {/* 桌面端显示摘要 */}
        <p className="mt-2 text-white/50 text-sm font-light leading-relaxed line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {post.excerpt}
        </p>
      </div>
    </div>
  );
});

BlogCard.displayName = 'BlogCard';

export default BlogCard;
