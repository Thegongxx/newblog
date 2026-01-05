
export interface Post {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readingTime: string;
  image: string;
  content: string;
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

export enum ViewState {
  INTRO = 'INTRO',
  FEED = 'FEED',
  POST = 'POST',
  ARCHIVE = 'ARCHIVE',
  NOTEBOOK = 'NOTEBOOK',
  ABOUT = 'ABOUT'
}
