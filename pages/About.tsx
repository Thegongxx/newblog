import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

// 直接导入 about.md 文件内容
import aboutMd from '../content/pages/about.md?raw';

const About: React.FC = () => {
    const [content, setContent] = useState<string>('');
    const [frontmatter, setFrontmatter] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const parseMarkdown = () => {
            try {
                setLoading(true);
                
                // 解析 frontmatter
                const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
                const match = aboutMd.match(frontmatterRegex);
                
                if (match) {
                    const [, frontmatterStr, markdownContent] = match;
                    
                    // 解析 frontmatter
                    const fm: any = {};
                    frontmatterStr.split('\n').forEach(line => {
                        const [key, ...valueParts] = line.split(':');
                        if (key && valueParts.length) {
                            fm[key.trim()] = valueParts.join(':').trim();
                        }
                    });
                    
                    setFrontmatter(fm);
                    
                    // 改进的 Markdown 转 HTML 解析
                    let htmlContent = markdownContent
                        // 处理标题
                        .replace(/^### (.*$)/gm, '<h3 class="text-2xl font-bold tracking-tight mb-6 mt-12 text-white">$1</h3>')
                        .replace(/^## (.*$)/gm, '<h2 class="text-4xl font-bold tracking-tight mb-8 mt-16 text-white">$1</h2>')
                        .replace(/^# (.*$)/gm, '<h1 class="text-7xl font-bold tracking-tighter mb-10 text-white">$1</h1>')
                        // 处理粗体和斜体
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em class="italic text-white/80">$1</em>')
                        // 处理引用
                        .replace(/^> (.*$)/gm, '<blockquote class="border-l-2 border-white/20 pl-8 py-4 my-8 italic text-xl text-white/80 bg-white/[0.02] rounded-r-2xl">$1</blockquote>')
                        // 处理段落
                        .split('\n\n')
                        .map(paragraph => {
                            const trimmed = paragraph.trim();
                            if (trimmed === '') return '';
                            
                            // 如果已经是HTML标签，直接返回
                            if (trimmed.startsWith('<h') || trimmed.startsWith('<blockquote')) {
                                return trimmed;
                            }
                            
                            // 普通段落
                            return `<p class="text-white/60 leading-[1.9] text-xl font-light mb-6">${trimmed}</p>`;
                        })
                        .filter(p => p !== '') // 过滤空段落
                        .join('\n');
                    
                    setContent(htmlContent);
                } else {
                    // 如果没有 frontmatter，直接处理内容
                    const simpleHtml = aboutMd
                        .replace(/^# (.*$)/gm, '<h1 class="text-7xl font-bold tracking-tighter mb-10 text-white">$1</h1>')
                        .replace(/^## (.*$)/gm, '<h2 class="text-4xl font-bold tracking-tight mb-8 mt-16 text-white">$1</h2>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
                        .split('\n\n')
                        .map(p => p.trim() ? `<p class="text-white/60 leading-[1.9] text-xl font-light mb-6">${p.trim()}</p>` : '')
                        .filter(p => p !== '')
                        .join('\n');
                    
                    setContent(simpleHtml);
                }
            } catch (error) {
                console.error('Failed to parse about content:', error);
                setContent('<p class="text-white/40">解析关于页面内容时出错。</p>');
            } finally {
                setLoading(false);
            }
        };

        parseMarkdown();
    }, []);

    if (loading) {
        return (
            <div className="max-w-3xl py-12 relative min-h-[600px] animate-pulse">
                <div className="h-20 w-48 bg-white/5 rounded-lg mb-10" />
                <div className="h-4 w-full bg-white/5 rounded mb-4" />
                <div className="h-4 w-full bg-white/5 rounded mb-4" />
                <div className="h-4 w-2/3 bg-white/5 rounded mb-16" />
                <div className="h-[1px] w-full bg-white/10 mb-16" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="h-32 bg-white/5 rounded-lg" />
                    <div className="h-32 bg-white/5 rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl py-12 relative min-h-[600px] animate-in fade-in duration-700">
            <Helmet>
                <title>{frontmatter.title || 'About'} | Aura</title>
                <meta name="description" content={frontmatter.excerpt || "Aura Design Philosophy"} />
            </Helmet>
            <div className="relative z-10">
                <article
                    className="prose prose-invert max-w-none prose-p:text-white/60 prose-p:leading-[1.9] prose-p:text-xl prose-p:font-light prose-headings:font-bold prose-headings:tracking-tighter prose-blockquote:border-white/20 prose-blockquote:text-white/80"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
        </div>
    );
};

export default About;
