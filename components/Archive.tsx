import React, { memo, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';
import { Post } from '../types';

interface ArchiveProps {
  posts: Post[];
  loading: boolean;
}

const ArchiveItem = memo<{
  post: Post;
  index: number;
  onClick: () => void;
}>(({ post, index, onClick }) => (
  <div 
    className="glass p-8 rounded-[2.5rem] flex items-center justify-between group cursor-pointer hover:bg-white/[0.08] transition-all border border-white/5 animate-fade-in-up interactive-hover interactive-press" 
    style={{ animationDelay: `${index * 50}ms` }} 
    onClick={onClick}
  >
    <div className="space-y-1 flex-1">
      <p className="text-white/30 text-[10px] uppercase tracking-widest">
        {post.date}
      </p>
      <h3 className="text-2xl font-semibold group-hover:translate-x-2 transition-transform duration-500">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="text-white/40 text-sm mt-2 line-clamp-2">
          {post.excerpt}
        </p>
      )}
    </div>
    <div className="flex items-center gap-4">
      <div className="p-4 rounded-full bg-white/5 group-hover:bg-white group-hover:text-black transition-all">
        {ICONS.CHEVRON_RIGHT}
      </div>
    </div>
  </div>
));

ArchiveItem.displayName = 'ArchiveItem';

const Archive: React.FC<ArchiveProps> = ({ posts, loading }) => {
  const navigate = useNavigate();

  // 按年份分组文章
  const groupedPosts = useMemo(() => {
    const groups: Record<string, Post[]> = {};
    
    posts.forEach(post => {
      const year = new Date(post.created_at).getFullYear().toString();
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(post);
    });

    // 按年份降序排序
    return Object.entries(groups)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .map(([year, yearPosts]) => ({
        year,
        posts: yearPosts.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }));
  }, [posts]);

  const handlePostClick = (post: Post) => {
    navigate(`/post/${post.slug}`);
  };

  return (
    <div className="py-12">
      <Helmet>
        <title>Archive | Aura</title>
        <meta name="description" content="探索 Aura 的文章归档，按时间整理的所有内容。" />
      </Helmet>
      
      <div className="mb-16">
        <h2 className="text-6xl font-bold tracking-tighter mb-4 animate-fade-in-up">
          归档文章
        </h2>
        <p className="text-white/40 text-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          共 {posts.length} 篇文章，按时间整理
        </p>
      </div>

      {loading ? (
        <div className="text-center text-white/40 py-12">加载中...</div>
      ) : (
        <div className="space-y-16">
          {groupedPosts.map(({ year, posts: yearPosts }, yearIndex) => (
            <div key={year} className="animate-fade-in-up" style={{ animationDelay: `${yearIndex * 100}ms` }}>
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-3xl font-bold text-white/80">{year}</h3>
                <div className="flex-1 h-[1px] bg-white/10" />
                <span className="text-white/30 text-sm">{yearPosts.length} 篇</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {yearPosts.map((post, postIndex) => (
                  <ArchiveItem
                    key={post.id}
                    post={post}
                    index={postIndex}
                    onClick={() => handlePostClick(post)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-20 animate-fade-in-up">
          <div className="text-6xl mb-6 opacity-20">📝</div>
          <h3 className="text-2xl font-bold text-white/60 mb-4">暂无文章</h3>
          <p className="text-white/40">期待第一篇文章的诞生</p>
        </div>
      )}
    </div>
  );
};

export default memo(Archive);