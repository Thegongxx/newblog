import React from 'react';
import { Post } from '../types';
import LikeButton from './LikeButton';

interface BlogCardProps {
  post: Post;
  onClick: () => void;
  featured?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, onClick, featured }) => {
  return (
    <div
      className={`group relative ${featured ? 'h-[280px] md:h-[380px]' : 'h-[240px] md:h-[320px]'} bg-white/[0.03] backdrop-blur-3xl rounded-xl md:rounded-2xl transition-all duration-500 hover:bg-white/[0.05] cursor-pointer overflow-hidden`}
      onClick={onClick}
    >
      {/* 全幅封面图容器 */}
      <div className="absolute inset-0 overflow-hidden rounded-xl md:rounded-2xl">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 grayscale-[0.1] group-hover:grayscale-0 opacity-60 group-hover:opacity-80"
        />
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* 分类标签 */}
      <div className="absolute top-3 left-3 md:top-4 md:left-4 px-2.5 md:px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[8px] md:text-[9px] font-bold text-white uppercase tracking-wider z-20">
        {post.category}
      </div>

      {/* 点赞按钮 */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-30">
        <LikeButton
          targetType="post"
          targetId={post.id}
          initialCount={post.likes_count}
          className="!bg-white/10 !backdrop-blur-xl !border-white/10 scale-[0.65] md:scale-75"
        />
      </div>

      {/* 内容区域 */}
      <div className="absolute inset-x-0 bottom-0 p-3 md:p-5 flex flex-col justify-end z-20">
        <div className="flex items-center gap-2 mb-1.5 md:mb-2 text-white/50 text-[8px] md:text-[9px] font-medium uppercase tracking-wider">
          <span>{post.date}</span>
          <span className="w-0.5 h-0.5 rounded-full bg-white/30" />
          <span>{post.readingTime}</span>
        </div>

        <h3 className={`${featured ? 'text-lg md:text-2xl' : 'text-base md:text-xl'} font-bold text-white tracking-tight leading-snug line-clamp-2`}>
          {post.title}
        </h3>

        {/* 桌面端显示摘要 */}
        <p className="hidden md:block mt-2 text-white/50 text-sm font-light leading-relaxed line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {post.excerpt}
        </p>
      </div>
    </div>
  );
};

export default BlogCard;
