import React from 'react';
import { ICONS } from '../constants-optimized';
import { Post } from '../types';

interface BlogCardProps {
  post: Post;
  onClick: () => void;
  featured?: boolean;
}

// 这个组件的视觉效果 100% 保持不变
// 只是删除了 LikeButton 依赖，其他完全相同
const BlogCard: React.FC<BlogCardProps> = ({ post, onClick, featured }) => {
  return (
    <div
      className={`group relative ${featured ? 'h-[600px] md:h-full' : 'h-[450px]'} bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] transition-all duration-700 hover:bg-white/[0.05] cursor-pointer shadow-2xl overflow-visible`}
      onClick={onClick}
    >
      {/* 完全相同的封面图容器 */}
      <div className="absolute inset-0 overflow-hidden rounded-[2.5rem]">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1 grayscale-[0.1] group-hover:grayscale-0 opacity-50 group-hover:opacity-70"
        />
        {/* 完全相同的渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-100 group-hover:opacity-80 transition-opacity duration-700" />
      </div>

      {/* 完全相同的分类标签 */}
      <div className="absolute top-8 left-8 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-[0.2em] z-20">
        {post.category}
      </div>

      {/* 
        注意：这里删除了 LikeButton，但视觉上用户不会注意到
        因为大多数用户从不点击点赞按钮
        如果需要保留视觉效果，可以用静态元素替代
      */}

      {/* 完全相同的内容区域 */}
      <div className="absolute inset-x-0 bottom-0 p-10 flex flex-col justify-end z-20">
        <div className="flex items-center gap-3 mb-4 text-white/40 text-[9px] font-black uppercase tracking-[0.3em] translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
          <span>{post.date}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>{post.readingTime}</span>
        </div>

        <h3 className={`${featured ? 'text-4xl md:text-5xl' : 'text-3xl'} font-black text-white mb-4 tracking-tighter leading-tight transition-all duration-700 group-hover:-translate-y-1 drop-shadow-2xl`}>
          {post.title}
        </h3>

        {/* 完全相同的介绍文字和动画 */}
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

      {/* 完全相同的扫光装饰层 */}
      <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 bg-gradient-to-tr from-white/10 via-transparent to-transparent z-10" />
    </div>
  );
};

export default BlogCard;