import React from 'react';
import BlogCard from '../components/BlogCard';
import HomepageComments from '../components/HomepageComments';
import { Post } from '../types';

interface FeedProps {
  posts: Post[];
  loading: boolean;
  onSelectPost: (post: Post) => void;
}

const Feed: React.FC<FeedProps> = ({ posts, loading, onSelectPost }) => {
  return (
    <div className="space-y-40">
      <section>
        <div className="max-w-3xl mb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h4 className="text-white/20 uppercase tracking-[0.5em] text-[10px] font-black mb-8">Personal Space</h4>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[0.95]">探索 <br /><span className="text-white/20 italic">纯粹瞬间.</span></h2>
          <p className="text-lg text-white/30 font-light max-w-lg leading-relaxed">在这里，我们探索技术、建筑与人类情感之间那些无形的联系。</p>
        </div>
        {loading ? (
          <div className="text-center text-white/40 py-12">加载中...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(0, 6).map((post, i) => (
              <div key={post.id} className="animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${i * 100}ms` }}>
                <BlogCard post={post} onClick={() => onSelectPost(post)} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 主页留言板 */}
      <HomepageComments />
    </div>
  );
};

export default Feed;
