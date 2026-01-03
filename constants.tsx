
import React from 'react';
import { Post } from './types';

export const BLOG_POSTS: Post[] = [
  {
    id: '1',
    title: '空间计算的未来设计',
    excerpt: '从 2D 屏幕到 3D 空间的转变如何重新定义我们与技术的关系。',
    category: '设计',
    date: '2023年10月12日',
    readingTime: '6 分钟',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
    content: `
      <p>在数字时代，复杂性往往被误认为是先进。但真正的创新在于能够将深刻的想法提炼成简单、优雅的形式。</p>
      <p>随着我们转向感觉更像环境而非工具的界面，设计的语言必须进化。这不再仅仅关乎你点击哪里，而关乎居住在数字空间中的感受。</p>
      <blockquote class="border-l-2 border-white/20 pl-6 italic text-2xl font-light text-white my-12">
        “设计不仅仅是外观和感觉。设计是它是如何工作的。”
      </blockquote>
      <p>Aura 的哲学就建立在这个基础上。我们寻求在嘈杂的世界中创造清晰的时刻，利用技术不是为了分散注意力，而是为了集中思想。</p>
    `
  },
  {
    id: '2',
    title: '极简主义的诗学',
    excerpt: '探讨为什么“少即是多”，以及减法设计如何带来更有意义的体验。',
    category: '哲学',
    date: '2023年9月28日',
    readingTime: '4 分钟',
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2067&auto=format&fit=crop',
    content: `
      <p>极简主义不是为了空无一物，而是为了去除那些阻碍我们体验本质的杂质。</p>
      <p>当我们减少视觉上的噪音，留白便开始说话。每一个线条，每一个像素都承担了更多的责任。</p>
    `
  }
];

export const ICONS = {
  SEARCH: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
  CHEVRON_RIGHT: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  ),
  AI: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.035-.259a3.375 3.375 0 0 0 2.456-2.455L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.455Zm-1.767 9.25.125-.5a1.875 1.875 0 0 1 1.365-1.365l.5-.125-.5-.125a1.875 1.875 0 0 1-1.365-1.365l-.125-.5-.125.5a1.875 1.875 0 0 1-1.365 1.365l-.5.125.5.125a1.875 1.875 0 0 1 1.365 1.365l.125.5Z" />
    </svg>
  )
};
