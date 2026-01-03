
export interface Post {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readingTime: string;
  image: string;
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
