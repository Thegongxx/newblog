
import React from 'react';
import { Post } from '../types';

interface BlogCardProps {
  post: Post;
  onClick: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-[3rem] glass transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)]"
    >
      <div className="aspect-[1.1] md:aspect-[1.4] overflow-hidden">
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity group-hover:opacity-70" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-12">
        <div className="flex items-center gap-4 mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest border border-white/10">
            {post.category}
          </span>
          <span className="text-white/40 text-[11px] font-medium">
            {post.readingTime}
          </span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tighter mb-4 transition-transform duration-700">
          {post.title}
        </h2>
        
        <p className="text-white/50 text-base leading-relaxed max-w-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-75 line-clamp-2 font-light">
          {post.excerpt}
        </p>
      </div>
    </div>
  );
};

export default BlogCard;
