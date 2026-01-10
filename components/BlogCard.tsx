import React from 'react';
import { ICONS } from '../constants';
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
      className={`group relative ${featured ? 'h-[400px] md:h-full' : 'h-[300px] md:h-[450px]'} bg-white/[0.03] backdrop-blur-3xl rounded-2xl md:rounded-[2.5rem] transition-all duration-700 hover:bg-white/[0.05] cursor-pointer shadow-2xl overflow-visible`}
      onClick={onClick}
    >
      {/* 全幅封面图容器 */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl md:rounded-[2.5rem]">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1 grayscale-[0.1] group-hover:grayscale-0 opacity-50 group-hover:opacity-70"
        />
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-100 group-hover:opacity-80 transition-opacity duration-700" />
      </div>

      {/* 分类标签 */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest md:tracking-[0.2em] z-20">
        {post.category}
      </div>

      {/* 点赞按钮 */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-30">
        <LikeButton
          targetType="post"
          targetId={post.id}
          initialCount={post.likes_count}
          className="!bg-white/10 !backdrop-blur-2xl !border-white/10 scale-75 md:scale-90"
        />
      </div>

      {/* 悬浮内容区域 */}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-10 flex flex-col justify-end z-20">
        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4 text-white/40 text-[8px] md:text-[9px] font-black uppercase tracking-widest md:tracking-[0.3em]">
          <span>{post.date}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>{post.readingTime}</span>
        </div>

        <h3 className={`${featured ? 'text-2xl md:text-5xl' : 'text-xl md:text-3xl'} font-black text-white mb-2 md:mb-4 tracking-tighter leading-tight line-clamp-2`}>
          {post.title}
        </h3>

        {/* 移动端隐藏悬浮介绍 */}
        <div className="hidden md:block opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100 blur-md group-hover:blur-0">
          <p className="text-white/60 text-lg font-light leading-relaxed mb-8 line-clamp-2">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-white transition-all duration-500">
            <span>READ STORY</span>
            <div className="transition-transform duration-500 group-hover:translate-x-2">
              {ICONS.CHEVRON_RIGHT}
            </div>
          </div>
        </div>
      </div>

      {/* 扫光装饰层 */}
      <div className="absolute inset-0 rounded-2xl md:rounded-[2.5rem] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 bg-gradient-to-tr from-white/10 via-transparent to-transparent z-10" />
    </div>
  );
};

export default BlogCard;
