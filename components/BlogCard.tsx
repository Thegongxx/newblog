
import React from 'react';
import { Post } from '../types';

interface BlogCardProps {
  post: Post;
  onClick: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, onClick }) => {
  return (
    <div className="relative group perspective-1000">
      {/* Outer Glow Bloom Effect - The "Hazy Beauty" */}
      <div className="absolute -inset-2 bg-white/10 rounded-[3.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-[1200ms] pointer-events-none" />
      
      <div 
        onClick={onClick}
        className="relative cursor-pointer overflow-hidden rounded-[3rem] glass transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] hover:-translate-y-2 hover:shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6),0_0_50px_-10px_rgba(255,255,255,0.08)] border-white/10 group-hover:border-white/20"
      >
        {/* Subtle Light-Leak Header Inner Shadow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none z-10" />

        <div className="aspect-[1.1] md:aspect-[1.4] overflow-hidden">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-[2500ms] ease-out group-hover:scale-110"
          />
          {/* Deepened Vignette for spatial depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 transition-opacity group-hover:opacity-80" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-12 z-20">
          <div className="flex items-center gap-4 mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-1000">
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
              {post.category}
            </span>
            <span className="text-white/40 text-[11px] font-medium tracking-tight">
              {post.readingTime}
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tighter mb-4 transition-all duration-700 delay-75 group-hover:text-white/100">
            {post.title}
          </h2>
          
          <p className="text-white/40 text-base leading-relaxed max-w-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-1000 delay-150 line-clamp-2 font-light">
            {post.excerpt}
          </p>
        </div>

        {/* Dynamic Highlight Flare */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.07] transition-opacity duration-1000 pointer-events-none" />
      </div>
    </div>
  );
};

export default BlogCard;
