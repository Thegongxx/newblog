import React from 'react';
import { Helmet } from 'react-helmet-async';

interface ArchiveProps {
  posts: any[];
  loading: boolean;
  onSelectPost?: (post: any) => void;
}

const Archive: React.FC<ArchiveProps> = ({ posts, loading, onSelectPost }) => {
  // 按年份分组文章
  const postsByYear = posts.reduce((acc, post) => {
    const year = new Date(post.created_at).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {} as Record<number, any[]>);

  const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a));

  if (loading) {
    return (
      <div className="max-w-4xl py-12">
        <div className="animate-pulse">
          <div className="h-12 w-48 bg-white/5 rounded-lg mb-12" />
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-4">
                <div className="h-8 w-20 bg-white/5 rounded" />
                <div className="space-y-3">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="h-6 w-full bg-white/5 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl py-12">
      <Helmet>
        <title>Archive | Aura</title>
        <meta name="description" content="文章归档 - 按时间浏览所有文章" />
      </Helmet>

      <div className="mb-16">
        <h1 className="text-6xl font-bold tracking-tighter mb-6 text-white">
          Archive
        </h1>
        <p className="text-white/40 text-lg">
          {posts.length} 篇文章，按时间归档
        </p>
      </div>

      <div className="space-y-16">
        {years.map(year => (
          <div key={year} className="group">
            <div className="flex items-center gap-6 mb-8">
              <h2 className="text-3xl font-bold text-white/80 group-hover:text-white transition-colors">
                {year}
              </h2>
              <div className="flex-1 h-px bg-white/10 group-hover:bg-white/20 transition-colors" />
              <span className="text-sm text-white/30 font-medium">
                {postsByYear[Number(year)].length} 篇
              </span>
            </div>

            <div className="space-y-6">
              {postsByYear[Number(year)].map((post, index) => (
                <article 
                  key={post.id}
                  className="group/post cursor-pointer"
                  onClick={() => onSelectPost?.(post)}
                >
                  <div className="flex items-start gap-6 p-6 rounded-2xl hover:bg-white/[0.02] transition-all duration-300 hover:scale-[1.01] border border-transparent hover:border-white/5">
                    <div className="flex-shrink-0 w-16 text-right">
                      <time className="text-sm text-white/40 font-mono">
                        {new Date(post.created_at).toLocaleDateString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </time>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-white/80 group-hover/post:text-white transition-colors mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      
                      {post.excerpt && (
                        <p className="text-white/40 text-sm leading-relaxed line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-white/30">
                        {post.category && (
                          <span className="px-2 py-1 bg-white/5 rounded-full">
                            {post.category}
                          </span>
                        )}
                        {post.reading_time && (
                          <span>{post.reading_time} 分钟阅读</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 opacity-0 group-hover/post:opacity-100 transition-opacity">
                      <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div className="text-center py-24">
          <div className="text-white/20 text-6xl mb-6">📝</div>
          <h3 className="text-2xl font-bold text-white/40 mb-4">暂无文章</h3>
          <p className="text-white/30">还没有发布任何文章</p>
        </div>
      )}
    </div>
  );
};

export default Archive;