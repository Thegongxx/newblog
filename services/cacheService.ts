import useSWR, { mutate } from 'swr';
import { postsApi } from './posts';
import { notesApi } from './notes';

// Cache configuration
const cacheConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1 minute deduplication
  errorRetryCount: 3,
};

// Fetchers
const fetchPosts = async () => {
  const data = await postsApi.getAll();
  return data.map((post: any) => ({
    ...post,
    image: post.cover_image,
    date: new Date(post.created_at).toLocaleDateString('zh-CN'),
    readingTime: `${post.reading_time} 分钟`,
    content: post.html_content || post.content,
  }));
};

const fetchNotes = async () => {
  const data = await notesApi.getAll();
  return data.map((note: any) => ({
    ...note,
    date: new Date(note.created_at).toLocaleDateString('zh-CN'),
    content: note.text || note.content,
  }));
};

const fetchPost = async (slug: string) => {
  const post = await postsApi.getBySlug(slug);
  return {
    ...post,
    image: post.cover_image,
    date: new Date(post.created_at).toLocaleDateString('zh-CN'),
    readingTime: `${post.reading_time} 分钟`,
    content: post.html_content || post.content,
  };
};

// Hooks
export function usePostsCache() {
  return useSWR('posts', fetchPosts, cacheConfig);
}

export function useNotesCache() {
  return useSWR('notes', fetchNotes, cacheConfig);
}

export function usePostCache(slug: string | null) {
  return useSWR(slug ? `post-${slug}` : null, () => fetchPost(slug!), cacheConfig);
}

// Cache invalidation
export const invalidateCache = {
  posts: () => mutate('posts'),
  notes: () => mutate('notes'),
  post: (slug: string) => mutate(`post-${slug}`),
  all: () => mutate(() => true, undefined, { revalidate: true }),
};

// Prefetch utilities
export const prefetch = {
  posts: () => mutate('posts', fetchPosts()),
  notes: () => mutate('notes', fetchNotes()),
  post: (slug: string) => mutate(`post-${slug}`, fetchPost(slug)),
};
