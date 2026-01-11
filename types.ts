
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

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string; // Markdown
  html_content?: string; // HTML
  excerpt?: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author: string;
  email: string;
  content: string;
  parent_id?: string;
  approved: boolean;
  created_at: string;
}

export interface NoteComment {
  id: string;
  note_id: string;
  author: string;
  email: string;
  content: string;
  parent_id?: string;
  approved: boolean;
  created_at: string;
}

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
  tags: string[];
}

export interface Quote {
  text: string;
  author: string;
  date: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
