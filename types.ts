
export interface Post {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readingTime: string;
  image: string;
  content: string; // 新增：文章正文支持 Markdown 或 HTML 字符串
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export enum ViewState {
  INTRO = 'INTRO',
  FEED = 'FEED',
  POST = 'POST'
}
