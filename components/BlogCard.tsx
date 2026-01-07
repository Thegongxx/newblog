
import React from 'react';
import { ICONS } from '../constants';
import { Post } from '../types';
import LikeButton from './LikeButton';

interface BlogCardProps {
  post: Post;
  onClick: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, onClick }) => {
  return (
    <div
      className="group relative h-[420px] bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-700 hover:border-white/10 cursor-pointer shadow-2xl"
      onClick={onClick}
    >
      {/* 封面图容器 */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1 grayscale-[0.5] group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

        {/* 分类标签 */}
        <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full glass text-[10px] font-bold text-white uppercase tracking-[0.2em] animate-in fade-in zoom-in duration-700">
          {post.category}
        </div>

        {/* 点赞按钮 (卡片形式) */}
        <div className="absolute bottom-6 right-6">
          <LikeButton
            targetType="post"
            targetId={post.id}
            initialCount={post.likes_count}
            className="!bg-black/20 !backdrop-blur-xl !border-white/10 scale-90"
          />
        </div>
      </div>

      {/* 内容区域 - 默认仅标题 */}
      <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end min-h-[160px] bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-all duration-700">
        <div className="flex items-center gap-3 mb-3 text-white/20 text-[8px] font-bold uppercase tracking-[0.2em]">
          <span>{post.date}</span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span>{post.readingTime}</span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2 tracking-tighter leading-tight transition-all duration-700 group-hover:-translate-y-2">
          {post.title}
        </h3>

        {/* 悬停缓缓显现的内容 */}
        <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-75 blur-lg group-hover:blur-0">
          <p className="text-white/40 text-sm font-light leading-relaxed mb-6 line-clamp-2">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-[0.1em]">
            <span>阅读全文</span>
            <div className="transition-transform duration-500 group-hover:translate-x-1">
              {ICONS.CHEVRON_RIGHT}
            </div>
          </div>
        </div>
      </div>

      {/* 交互装饰 */}
      <div className="absolute inset-0 border-[0.5px] border-white/0 rounded-[2.5rem] group-hover:border-white/20 pointer-events-none transition-all duration-700" />
    </div>
  );
};

export default BlogCard;
