
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
      className="group relative h-full flex flex-col bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.04] transition-all duration-700 hover:-translate-y-2 cursor-pointer shadow-2xl hover:shadow-white/10"
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

      {/* 内容区域 */}
      <div className="p-10 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-6 text-white/20 text-[9px] font-bold uppercase tracking-[0.3em]">
          <span>{post.date}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>{post.readingTime}</span>
        </div>

        {/* 悬停显示的详细内容容器 */}
        <div className="flex-1 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
          <h3 className="text-3xl font-bold text-white mb-4 tracking-tighter leading-tight group-hover:text-white transition-colors duration-500">
            {post.title}
          </h3>

          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
            <div className="overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">
              <p className="text-white/40 text-lg font-light leading-relaxed mb-8 line-clamp-3">
                {post.excerpt}
              </p>

              <div className="flex items-center gap-2 text-white/30 text-xs font-bold uppercase tracking-[0.2em] group-hover:text-white transition-all duration-500">
                <span>阅读全文</span>
                <div className="transition-transform duration-500 group-hover:translate-x-2">
                  {ICONS.CHEVRON_RIGHT}
                </div>
              </div>
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
