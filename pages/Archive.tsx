import React from 'react';

interface ArchiveProps {
  posts: any[];
  loading: boolean;
  onSelectPost?: (post: any) => void;
}

const Archive: React.FC<ArchiveProps> = ({ posts, loading, onSelectPost }) => {
  // 按年月分组文章
  const postsByYearMonth = posts.reduce((acc, post) => {
    const date = new Date(post.created_at);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份从0开始，需要+1
    const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
    
    if (!acc[year]) acc[year] = {};
    if (!acc[year][yearMonth]) acc[year][yearMonth] = [];
    acc[year][yearMonth].push(post);
    return acc;
  }, {} as Record<number, Record<string, any[]>>);

  const years = Object.keys(postsByYearMonth).sort((a, b) => Number(b) - Number(a));

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
      <div className="mb-16">
        <h1 className="text-6xl font-bold tracking-tighter mb-6 text-white">
          Archive
        </h1>
        <p className="text-white/40 text-lg">
          {posts.length} 篇文章，按时间归档
        </p>
      </div>

      <div className="space-y-20">
        {years.map(year => {
          const yearData = postsByYearMonth[Number(year)];
          const yearMonths = Object.keys(yearData).sort((a, b) => b.localeCompare(a));
          const totalPostsInYear = Object.values(yearData).flat().length;
          
          return (
            <div key={year} className="group">
              <div className="flex items-center gap-6 mb-12">
                <h2 className="text-4xl font-bold text-white/80 group-hover:text-white transition-colors">
                  {year}
                </h2>
                <div className="flex-1 h-px bg-white/10 group-hover:bg-white/20 transition-colors" />
                <span className="text-sm text-white/30 font-medium">
                  {totalPostsInYear} 篇
                </span>
              </div>

              <div className="space-y-12">
                {yearMonths.map(yearMonth => {
                  const monthPosts = yearData[yearMonth];
                  const [, monthStr] = yearMonth.split('-');
                  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                                    '七月', '八月', '九月', '十月', '十一月', '十二月'];
                  const monthName = monthNames[parseInt(monthStr) - 1];
                  
                  return (
                    <div key={yearMonth} className="ml-8">
                      <div className="flex items-center gap-4 mb-6">
                        <h3 className="text-xl font-semibold text-white/60 hover:text-white/80 transition-colors">
                          {monthName}
                        </h3>
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-xs text-white/20 font-medium">
                          {monthPosts.length} 篇
                        </span>
                      </div>

                      <div className="space-y-4">
                        {monthPosts.map((post, index) => (
                          <article 
                            key={post.id}
                            className="group/post cursor-pointer"
                            onClick={() => onSelectPost?.(post)}
                          >
                            <div className="flex items-start gap-6 p-4 rounded-xl hover:bg-white/[0.015] transition-all duration-300 hover:scale-[1.005] border border-transparent hover:border-white/[0.03]">
                              <div className="flex-shrink-0 w-12 text-right">
                                <time className="text-xs text-white/30 font-mono">
                                  {new Date(post.created_at).toLocaleDateString('zh-CN', {
                                    day: '2-digit'
                                  })}
                                </time>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-medium text-white/70 group-hover/post:text-white transition-colors mb-1 line-clamp-1">
                                  {post.title}
                                </h4>
                                
                                {post.excerpt && (
                                  <p className="text-white/30 text-sm leading-relaxed line-clamp-1 mb-2">
                                    {post.excerpt}
                                  </p>
                                )}
                                
                                <div className="flex items-center gap-3 text-xs text-white/20">
                                  {post.category && (
                                    <span className="px-2 py-0.5 bg-white/[0.03] rounded-full">
                                      {post.category}
                                    </span>
                                  )}
                                  {post.reading_time && (
                                    <span>{post.reading_time} 分钟</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex-shrink-0 opacity-0 group-hover/post:opacity-100 transition-opacity">
                                <div className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center">
                                  <svg className="w-2.5 h-2.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
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