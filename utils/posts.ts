import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { Post } from '../types';

// 配置marked
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(code, { language: lang }).value;
            } catch (err) {
                console.error('Highlight error:', err);
            }
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
});

// 简单的 Markdown Frontmatter 解析器
function parsePost(fileName: string, rawContent: string): Post {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n+/;
    const match = rawContent.match(frontmatterRegex);
    
    if (!match) {
        throw new Error(`Invalid frontmatter in ${fileName}`);
    }
    
    const frontmatter = match[1];
    const content = rawContent.slice(match[0].length);
    
    // 解析 frontmatter
    const metadata: any = {};
    frontmatter.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.slice(0, colonIndex).trim();
            const value = line.slice(colonIndex + 1).trim();
            
            // 处理不同类型的值
            if (value === 'true') metadata[key] = true;
            else if (value === 'false') metadata[key] = false;
            else if (!isNaN(Number(value)) && value !== '') metadata[key] = Number(value);
            else metadata[key] = value;
        }
    });
    
    const slug = fileName.replace('.md', '');
    
    // 转换markdown为HTML
    const htmlContent = marked(content);
    
    return {
        id: slug,
        slug,
        title: metadata.title || slug,
        content,
        html_content: htmlContent,
        excerpt: metadata.excerpt || '',
        category: metadata.category || 'uncategorized',
        cover_image: metadata.cover_image || '',
        reading_time: metadata.reading_time || 5,
        published: metadata.published !== false, // 默认为true
        created_at: metadata.date ? new Date(metadata.date).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 0,
        author: metadata.author || 'Aura'
    };
}

export function getAllPosts(): Post[] {
    // 在客户端环境下返回空数组，避免文件系统访问错误
    if (typeof window !== 'undefined') {
        console.warn('getAllPosts called on client side, returning empty array');
        return [];
    }
    
    try {
        const postsDir = path.join(process.cwd(), 'content', 'posts');
        
        if (!fs.existsSync(postsDir)) {
            console.warn('Posts directory not found:', postsDir);
            return [];
        }
        
        const files = fs.readdirSync(postsDir)
            .filter(file => file.endsWith('.md'));
        
        const posts = files.map(file => {
            const filePath = path.join(postsDir, file);
            const rawContent = fs.readFileSync(filePath, 'utf-8');
            return parsePost(file, rawContent);
        }).filter(post => post.published)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        return posts;
    } catch (error) {
        console.error('Error reading posts:', error);
        return [];
    }
}

export function getPostBySlug(slug: string): Post | null {
    // 在客户端环境下返回null
    if (typeof window !== 'undefined') {
        console.warn('getPostBySlug called on client side, returning null');
        return null;
    }
    
    try {
        const postsDir = path.join(process.cwd(), 'content', 'posts');
        const filePath = path.join(postsDir, `${slug}.md`);
        
        if (!fs.existsSync(filePath)) {
            return null;
        }
        
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        const post = parsePost(`${slug}.md`, rawContent);
        
        return post.published ? post : null;
    } catch (error) {
        console.error('Error reading post:', error);
        return null;
    }
}