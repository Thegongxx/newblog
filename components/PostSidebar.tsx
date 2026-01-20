import React from 'react';
import { motion } from 'framer-motion';
import { Post } from '../types';
import LikeButton from './LikeButton';
import TableOfContents from './TableOfContents';
import { APPLE_EASING } from '../constants/animations';
import { ICONS } from '../constants';

interface PostSidebarProps {
  post: Post;
  className?: string;
}

const PostSidebar: React.FC<PostSidebarProps> = ({ post, className = "" }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* 文章信息卡片 */}
      <motion.div
        className="glass rounded-2xl p-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={APPLE_EASING.spring}
      >
        <div className="space-y-3">
          {/* 点赞按钮 */}
          <div className="flex items-center justify-center">
            <LikeButton
              targetType="post"
              targetId={post.id}
              initialCount={post.likes_count || 0}
              className="!bg-white/5 !border-white/10 hover:!bg-white/10 !px-6 !py-3"
            />
          </div>
          
          {/* 分隔线 */}
          <div className="h-px bg-white/10" />
          
          {/* 文章统计 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">浏览量</span>
              <span className="text-white/80 font-medium">
                {post.views || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">阅读时间</span>
              <span className="text-white/80 font-medium">
                {post.readingTime}
              </span>
            </div>
            
            {post.category && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">分类</span>
                <span className="text-white/80 font-medium bg-white/10 px-2 py-1 rounded-full text-xs">
                  {post.category}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">发布日期</span>
              <span className="text-white/80 font-medium">
                {post.date}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 目录 */}
      <TableOfContents content={post.content} />

      {/* 分享按钮 */}
      <motion.div
        className="glass rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...APPLE_EASING.spring, delay: 0.1 }}
      >
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
          分享
        </h3>
        
        <div className="flex gap-3">
          <motion.button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: post.title,
                  text: post.excerpt,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                // 可以添加一个toast提示
              }
            }}
            className="flex-1 glass rounded-lg p-3 text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-lg mb-1">{ICONS.SHARE}</div>
            <div className="text-xs">分享</div>
          </motion.button>
          
          <motion.button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              // 可以添加一个toast提示
            }}
            className="flex-1 glass rounded-lg p-3 text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-lg mb-1">{ICONS.LINK}</div>
            <div className="text-xs">复制</div>
          </motion.button>
        </div>
      </motion.div>

      {/* 返回顶部 */}
      <motion.button
        onClick={() => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }}
        className="w-full glass rounded-2xl p-4 text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...APPLE_EASING.spring, delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="text-lg mb-1">{ICONS.ARROW_UP}</div>
        <div className="text-xs font-medium">返回顶部</div>
      </motion.button>
    </div>
  );
};

export default PostSidebar;