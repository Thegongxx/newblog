import { useState, useEffect, useCallback, useRef } from 'react';
import { postsApi, notesApi } from '../services/supabaseService';
import { Post } from '../types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5分钟

  set<T>(key: string, data: T, expiry = this.DEFAULT_EXPIRY): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

const dataCache = new DataCache();

interface UseDataFetchingResult {
  posts: Post[];
  notes: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDataFetching = (): UseDataFetchingResult => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const formatPost = useCallback((post: any): Post => ({
    ...post,
    image: post.cover_image,
    date: new Date(post.created_at).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    readingTime: `${post.reading_time} 分钟`,
    content: post.html_content || post.content
  }), []);

  const formatNote = useCallback((note: any) => ({
    ...note,
    date: new Date(note.created_at).toLocaleDateString('zh-CN')
  }), []);

  const fetchData = useCallback(async (useCache = true) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);

      // 检查缓存
      if (useCache) {
        const cachedPosts = dataCache.get<Post[]>('posts');
        const cachedNotes = dataCache.get<any[]>('notes');
        
        if (cachedPosts && cachedNotes) {
          setPosts(cachedPosts);
          setNotes(cachedNotes);
          setLoading(false);
          return;
        }
      }

      // 并行获取数据
      const [postsData, notesData] = await Promise.all([
        postsApi.getAll(),
        notesApi.getAll()
      ]);

      // 检查请求是否被取消
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const formattedPosts = postsData.map(formatPost);
      const formattedNotes = notesData.map(formatNote);

      // 更新状态
      setPosts(formattedPosts);
      setNotes(formattedNotes);

      // 缓存数据
      dataCache.set('posts', formattedPosts);
      dataCache.set('notes', formattedNotes);

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to load data:', err);
        setError(err.message || '数据加载失败');
        
        // 尝试使用缓存数据作为降级方案
        const cachedPosts = dataCache.get<Post[]>('posts');
        const cachedNotes = dataCache.get<any[]>('notes');
        
        if (cachedPosts && cachedNotes) {
          setPosts(cachedPosts);
          setNotes(cachedNotes);
          setError('使用缓存数据，可能不是最新版本');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [formatPost, formatNote]);

  const refetch = useCallback(() => fetchData(false), [fetchData]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    posts,
    notes,
    loading,
    error,
    refetch
  };
};