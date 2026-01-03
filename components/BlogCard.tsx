
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
      className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-zinc-900 border border-white/5 transition-all duration-700 hover:border-white/20"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-semibold uppercase tracking-widest text-white/80 border border-white/10">
            {post.category}
          </span>
          <span className="text-white/40 text-xs font-medium">
            {post.readingTime}
          </span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4 transition-transform duration-500 group-hover:-translate-y-1">
          {post.title}
        </h2>
        
        <p className="text-white/60 text-lg leading-relaxed max-w-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-100 line-clamp-2">
          {post.excerpt}
        </p>

        <div className="mt-8 flex items-center gap-2 text-white font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-200">
          <span>Explore Chapter</span>
          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
