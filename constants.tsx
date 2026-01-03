
import React from 'react';
import { Post } from './types';

export const BLOG_POSTS: Post[] = [
  {
    id: '1',
    title: 'Designing for the Future of Spatial Computing',
    excerpt: 'How the shift from 2D screens to 3D spaces is redefining our relationship with technology and interfaces.',
    category: 'Design',
    date: 'Oct 12, 2023',
    readingTime: '6 min',
    image: 'https://picsum.photos/seed/spatial/1200/800'
  },
  {
    id: '2',
    title: 'The Poetics of Minimalism',
    excerpt: 'Exploring why less is often more, and how subtractive design leads to more meaningful experiences.',
    category: 'Philosophy',
    date: 'Sep 28, 2023',
    readingTime: '4 min',
    image: 'https://picsum.photos/seed/minimal/1200/800'
  },
  {
    id: '3',
    title: 'Large Language Models as Creative Partners',
    excerpt: 'A deep dive into how AI is becoming a collaborator rather than just a tool for modern developers.',
    category: 'Tech',
    date: 'Aug 15, 2023',
    readingTime: '8 min',
    image: 'https://picsum.photos/seed/ai/1200/800'
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
