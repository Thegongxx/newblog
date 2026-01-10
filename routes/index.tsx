import { lazy } from 'react';

// Lazy load all page components
export const Feed = lazy(() => import('@/pages/Feed'));
export const PostDetail = lazy(() => import('@/pages/PostDetail'));
export const Notes = lazy(() => import('@/pages/Notes'));
export const NoteDetail = lazy(() => import('@/pages/NoteDetail'));
export const About = lazy(() => import('@/pages/About'));
export const Archive = lazy(() => import('@/pages/Archive'));
