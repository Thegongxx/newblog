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
      className={`group relative ${featured ? 'h-[600px] md:h-full' : 'h-[450px]'} bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] transition-all duration-700 hover:border-white/20 cursor-pointer shadow-2xl overflow-visible`}
      onClick={onClick}
    >
      {/* 全幅封面图容器 - 现在是卡片的背景底层 */}
      <div className="absolute inset-0 overflow-hidden rounded-[2.5rem]">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1 grayscale-[0.1] group-hover:grayscale-0 opacity-50 group-hover:opacity-70"
        />
        {/* 渐变遮罩 - 增强底部对比度 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-100 group-hover:opacity-80 transition-opacity duration-700" />
      </div>

      {/* 分类标签 - 放在外层以确保不被 overflow 裁剪 */}
      <div className="absolute top-8 left-8 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black text-white uppercase tracking-[0.2em] z-20">
        {post.category}
      </div>

      {/* 点赞按钮 - 移到外层容器，解决动画裁剪问题 */}
      <div className="absolute top-8 right-8 z-30">
        <LikeButton
          targetType="post"
          targetId={post.id}
          initialCount={post.likes_count}
          className="!bg-white/10 !backdrop-blur-2xl !border-white/10 scale-90"
        />
      </div>

      {/* 悬浮内容区域 */}
      <div className="absolute inset-x-0 bottom-0 p-10 flex flex-col justify-end z-20">
        <div className="flex items-center gap-3 mb-4 text-white/40 text-[9px] font-black uppercase tracking-[0.3em] translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
          <span>{post.date}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>{post.readingTime}</span>
        </div>

        <h3 className={`${featured ? 'text-4xl md:text-5xl' : 'text-3xl'} font-black text-white mb-4 tracking-tighter leading-tight transition-all duration-700 group-hover:-translate-y-1 drop-shadow-2xl`}>
          {post.title}
        </h3>

        {/* 缓缓显现的介绍 */}
        <div className="opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100 blur-md group-hover:blur-0">
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
      <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 bg-gradient-to-tr from-white/10 via-transparent to-transparent z-10" />

      {/* 交互装饰边框 */}
      <div className="absolute inset-0 border-[0.5px] border-white/5 rounded-[2.5rem] group-hover:border-white/30 pointer-events-none transition-all duration-700 z-40" />
    </div>
  );
};

export default BlogCard;
