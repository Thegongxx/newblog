/**
 * 类型定义 - 优化版
 * 使用基础接口和扩展，提供更精确的类型约束
 */

// ==========================================
// 基础评论接口
// ==========================================
export interface BaseComment {
  id: string;
  author: string;
  email: string;
  content: string;
  parent_id?: string;
  approved: boolean;
  created_at: string;
}

export interface PostComment extends BaseComment {
  post_id: string;
}

export interface NoteComment extends BaseComment {
  note_id: string;
}

export interface HomepageComment extends BaseComment {
  // 无需外键，直接使用基础接口
}

// 通用 Comment 类型（向后兼容）
export type Comment = PostComment | NoteComment | HomepageComment;

// ==========================================
// 文章相关
// ==========================================
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  html_content?: string;
  excerpt: string;
  category: string;
  cover_image: string;
  reading_time: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  views?: number;
  likes_count?: number;
  // 为了向后兼容，添加旧格式字段
  image?: string;
  date?: string;
  readingTime?: string;
}

// ==========================================
// 页面相关
// ==========================================
export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string; // Markdown
  html_content?: string; // HTML
  excerpt?: string;
  updated_at: string;
}

// ==========================================
// 笔记相关
// ==========================================
export interface Note {
  id: string;
  text: string;
  author: string;
  slug?: string;
  likes_count: number;
  comments_count?: number;
  created_at: string;
}

export interface FileNote {
  id: string;
  title: string;
  content: string;
  date: string;
  tags?: string[];
  likes_count?: number;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// 其他
// ==========================================
export interface Quote {
  text: string;
  author: string;
  date: string;
}

export enum ViewState {
  INTRO = 'intro',
  FEED = 'list',
  NOTEBOOK = 'notes',
  ARCHIVE = 'detail',
  ABOUT = 'assistant'
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ==========================================
// API 响应类型
// ==========================================
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// ==========================================
// 表单类型
// ==========================================
export interface CommentFormData {
  author: string;
  email: string;
  content: string;
  parentId?: string;
}
