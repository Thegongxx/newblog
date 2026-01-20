import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { APPLE_EASING } from '../constants/animations';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ content, className = "" }) => {
  const [activeId, setActiveId] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  // 从HTML内容中提取标题
  const tocItems = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    return Array.from(headings).map((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent || '';
      // 生成更好的ID
      const id = heading.id || `heading-${text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '')}-${index}`;
      
      return { id, text, level };
    });
  }, [content]);

  // 在实际DOM中添加ID
  useEffect(() => {
    if (tocItems.length === 0) return;

    const timer = setTimeout(() => {
      const articleElement = document.querySelector('.prose');
      if (!articleElement) return;

      const headings = articleElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach((heading, index) => {
        if (tocItems[index] && !heading.id) {
          heading.id = tocItems[index].id;
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [tocItems, content]);

  // 监听滚动，更新活跃的标题
  useEffect(() => {
    if (tocItems.length === 0) return;

    const handleScroll = () => {
      const headings = tocItems.map(item => document.getElementById(item.id)).filter(Boolean);
      
      if (headings.length === 0) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // 找到当前可见的标题
      let currentActiveId = '';
      
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        if (heading) {
          const rect = heading.getBoundingClientRect();
          if (rect.top <= windowHeight * 0.3) {
            currentActiveId = heading.id;
            break;
          }
        }
      }
      
      setActiveId(currentActiveId);
    };

    // 延迟执行，确保DOM已渲染
    const timer = setTimeout(() => {
      handleScroll();
      window.addEventListener('scroll', handleScroll, { passive: true });
    }, 500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [tocItems]);

  // 检查是否有足够的内容显示TOC
  useEffect(() => {
    setIsVisible(tocItems.length >= 2);
  }, [tocItems]);

  // 点击跳转到对应标题
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // 导航栏高度
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className={`${className}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={APPLE_EASING.spring}
    >
      <div className="glass rounded-xl p-4 space-y-3 backdrop-blur-md bg-white/[0.03] border border-white/10">
        <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
          目录
        </h3>
        
        <nav className="space-y-1 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {tocItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToHeading(item.id)}
                className={`
                  block w-full text-left text-xs transition-all duration-200
                  hover:text-white hover:bg-white/5 rounded-md px-2 py-1.5
                  ${activeId === item.id 
                    ? 'text-white bg-white/10 border-l-2 border-white/50' 
                    : 'text-white/50'
                  }
                `}
                style={{
                  paddingLeft: `${(item.level - 1) * 8 + 8}px`
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  ...APPLE_EASING.spring,
                  delay: index * 0.03
                }}
                whileHover={{
                  x: 2,
                  transition: { ...APPLE_EASING.spring, duration: 0.15 }
                }}
              >
                <span className="line-clamp-2 leading-relaxed text-xs">
                  {item.text}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </nav>
      </div>
    </motion.div>
  );
};

export default TableOfContents;