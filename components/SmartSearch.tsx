import React, { useState, useEffect, useRef } from 'react';
import { ICONS } from '../constants';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: 'post' | 'note' | 'page';
  url: string;
}

interface SmartSearchProps {
  data: any[];
  onSelect: (result: SearchResult) => void;
}

const SmartSearch: React.FC<SmartSearchProps> = ({ data, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 搜索逻辑
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const searchTerm = query.toLowerCase();

    // 搜索文章
    data.forEach(item => {
      if (item.title?.toLowerCase().includes(searchTerm) || 
          item.content?.toLowerCase().includes(searchTerm) ||
          item.excerpt?.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          id: item.id,
          title: item.title,
          excerpt: item.excerpt || item.content?.substring(0, 100) + '...',
          type: item.type || 'post',
          url: `/post/${item.slug}`
        });
      }
    });

    setResults(searchResults.slice(0, 8));
    setSelectedIndex(0);
  }, [query, data]);

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      onSelect(results[selectedIndex]);
      setIsOpen(false);
      setQuery('');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-8 z-[80] glass px-4 py-2 rounded-full text-white/40 hover:text-white/60 transition-all duration-300 group"
      >
        <div className="flex items-center gap-2">
          {ICONS.SEARCH}
          <span className="text-xs font-medium">搜索</span>
          <kbd className="px-2 py-1 text-[10px] bg-white/10 rounded border border-white/20">⌘K</kbd>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-32 px-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
      />
      
      {/* 搜索面板 */}
      <div className="relative w-full max-w-2xl bg-[#0d0d0d]/90 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in slide-in-from-top-4 duration-300">
        {/* 搜索输入 */}
        <div className="flex items-center gap-4 p-6 border-b border-white/5">
          <div className="text-white/40">{ICONS.SEARCH}</div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索文章、笔记..."
            className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-lg"
            autoFocus
          />
          <kbd className="px-3 py-1 text-xs bg-white/5 rounded border border-white/10 text-white/40">ESC</kbd>
        </div>

        {/* 搜索结果 */}
        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          {results.length === 0 && query ? (
            <div className="p-8 text-center text-white/30">
              <div className="text-4xl mb-4">🔍</div>
              <p>未找到相关内容</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-white/30">
              <div className="text-4xl mb-4">✨</div>
              <p>输入关键词开始搜索</p>
            </div>
          ) : (
            results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => {
                  onSelect(result);
                  setIsOpen(false);
                  setQuery('');
                }}
                className={`w-full p-4 text-left hover:bg-white/5 transition-all duration-200 border-b border-white/5 last:border-b-0 ${
                  index === selectedIndex ? 'bg-white/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-white/40">
                    {result.type === 'post' ? '📄' : result.type === 'note' ? '📝' : '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{result.title}</h3>
                    <p className="text-sm text-white/50 mt-1 line-clamp-2">{result.excerpt}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* 底部提示 */}
        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between text-xs text-white/30">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white/5 rounded">↑↓</kbd> 导航
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white/5 rounded">↵</kbd> 选择
              </span>
            </div>
            <span>{results.length} 个结果</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSearch;