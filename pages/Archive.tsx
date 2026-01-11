import type { FC } from 'react';
import { motion } from 'framer-motion';

interface ArchiveProps {
  posts: any[];
  loading: boolean;
  onSelectPost?: (post: any) => void;
}

// 统一动画配置
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const, staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } }
};

const Archive: FC<ArchiveProps> = ({ posts, loading, onSelectPost }) => {
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
    <motion.div 
      className="max-w-4xl py-8 md:py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="mb-10 md:mb-16" variants={itemVariants}>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 md:mb-6 text-white">
          Archive
        </h1>
        <p className="text-white/40 text-base md:text-lg">
          {posts.length} 篇文章
        </p>
      </motion.div>

      <motion.div className="space-y-12 md:space-y-20" variants={itemVariants}>
        {years.map(year => {
          const yearData = postsByYearMonth[Number(year)];
          const yearMonths = Object.keys(yearData).sort((a, b) => b.localeCompare(a));
          const totalPostsInYear = Object.values(yearData).flat().length;
          
          return (
            <motion.div key={year} className="group" variants={itemVariants}>
              <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-12">
                <h2 className="text-2xl md:text-4xl font-bold text-white/80">
                  {year}
                </h2>
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs md:text-sm text-white/30 font-medium">
                  {totalPostsInYear} 篇
                </span>
              </div>

              <div className="space-y-8 md:space-y-12">
                {yearMonths.map(yearMonth => {
                  const monthPosts = yearData[yearMonth];
                  const [, monthStr] = yearMonth.split('-');
                  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                                    '七月', '八月', '九月', '十月', '十一月', '十二月'];
                  const monthName = monthNames[parseInt(monthStr) - 1];
                  
                  return (
                    <div key={yearMonth} className="ml-2 md:ml-8">
                      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                        <h3 className="text-base md:text-xl font-semibold text-white/60">
                          {monthName}
                        </h3>
                        <div className="flex-1 h-px bg-white/5" />
                      </div>

                      <div className="space-y-2 md:space-y-4">
                        {monthPosts.map((post, index) => (
                          <article 
                            key={post.id}
                            className="group/post cursor-pointer"
                            onClick={() => onSelectPost?.(post)}
                          >
                            <div className="flex items-start gap-3 md:gap-6 p-3 md:p-4 rounded-xl hover:bg-white/[0.015] transition-all">
                              <div className="flex-shrink-0 w-8 md:w-12 text-right">
                                <time className="text-[10px] md:text-xs text-white/30 font-mono">
                                  {new Date(post.created_at).toLocaleDateString('zh-CN', {
                                    day: '2-digit'
                                  })}
                                </time>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm md:text-lg font-medium text-white/70 group-hover/post:text-white transition-colors line-clamp-1">
                                  {post.title}
                                </h4>
                                
                                {/* 移动端隐藏摘要 */}
                                {post.excerpt && (
                                  <p className="hidden md:block text-white/30 text-sm leading-relaxed line-clamp-1 mt-1">
                                    {post.excerpt}
                                  </p>
                                )}
                              </div>

                              <div className="flex-shrink-0 text-white/20">→</div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {posts.length === 0 && !loading && (
        <motion.div className="text-center py-16 md:py-24" variants={itemVariants}>
          <div className="text-white/20 text-4xl md:text-6xl mb-4 md:mb-6">📝</div>
          <h3 className="text-xl md:text-2xl font-bold text-white/40 mb-2 md:mb-4">暂无文章</h3>
          <p className="text-white/30 text-sm md:text-base">还没有发布任何文章</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Archive;