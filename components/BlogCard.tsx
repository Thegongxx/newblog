
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
      className="group relative h-[450px] bg-black border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:border-white/20 cursor-pointer shadow-2xl"
      onClick={onClick}
    >
      {/* 全幅封面图容器 */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1 grayscale-[0.3] group-hover:grayscale-0 opacity-60 group-hover:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-700" />

        {/* 分类标签 */}
        <div className="absolute top-8 left-8 px-4 py-1.5 rounded-full glass text-[10px] font-bold text-white uppercase tracking-[0.2em] z-10">
          {post.category}
        </div>

        {/* 点赞按钮 */}
        <div className="absolute top-8 right-8 z-10">
          <LikeButton
            targetType="post"
            targetId={post.id}
            initialCount={post.likes_count}
            className="!bg-black/20 !backdrop-blur-xl !border-white/10 scale-90"
          />
        </div>
      </div>

      {/* 悬浮内容区域 - 直接浮现在照片上 */}
      <div className="absolute inset-x-0 bottom-0 p-10 flex flex-col justify-end z-10">
        <div className="flex items-center gap-3 mb-4 text-white/40 text-[9px] font-black uppercase tracking-[0.3em] translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
          <span>{post.date}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>{post.readingTime}</span>
        </div>

        <h3 className="text-3xl font-black text-white mb-4 tracking-tighter leading-tight transition-all duration-700 group-hover:-translate-y-1">
          {post.title}
        </h3>

        {/* 缓缓显现的介绍 */}
        <div className="opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100 blur-md group-hover:blur-0">
          <p className="text-white/60 text-lg font-light leading-relaxed mb-8 line-clamp-3">
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
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 bg-gradient-to-tr from-white/5 via-transparent to-transparent" />

      {/* 交互装饰 */}
      <div className="absolute inset-0 border-[0.5px] border-white/0 rounded-[2.5rem] group-hover:border-white/20 pointer-events-none transition-all duration-700" />
    </div>
  );
};

export default BlogCard;
