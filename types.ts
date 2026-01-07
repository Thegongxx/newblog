
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
  // 为了向后兼容，添加旧格式字段
  image?: string;
  date?: string;
  readingTime?: string;
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
  ABOUT = 'assistant',
  ADMIN = 'aura-admin'
}
