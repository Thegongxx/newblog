import React, { useEffect, useState } from 'react';
import aboutMd from '../content/pages/about.md?raw';

const About: React.FC = () => {
    const [content, setContent] = useState<string>('');
    const [frontmatter, setFrontmatter] = useState<any>({});

    useEffect(() => {
        // Simple markdown parser
        const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = aboutMd.match(frontmatterRegex);
        
        if (match) {
            const [, frontmatterStr, markdownContent] = match;
            
            // Parse frontmatter
            const fm: any = {};
            frontmatterStr.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length) {
                    fm[key.trim()] = valueParts.join(':').trim();
                }
            });
            setFrontmatter(fm);
            
            // Convert markdown to HTML
            const htmlContent = markdownContent
                .replace(/^# (.*$)/gm, '<h1 class="text-6xl font-bold mb-8 text-white">$1</h1>')
                .replace(/^## (.*$)/gm, '<h2 class="text-3xl font-bold mb-6 mt-12 text-white">$1</h2>')
                .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-4 mt-8 text-white">$1</h3>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="italic text-white/80">$1</em>')
                .replace(/^> (.*$)/gm, '<blockquote class="border-l-2 border-white/20 pl-6 py-2 my-6 italic text-white/80">$1</blockquote>')
                .split('\n\n')
                .map(paragraph => {
                    const trimmed = paragraph.trim();
                    if (!trimmed || trimmed.startsWith('<h') || trimmed.startsWith('<blockquote')) {
                        return trimmed;
                    }
                    return `<p class="text-white/60 leading-relaxed text-lg mb-4">${trimmed}</p>`;
                })
                .filter(p => p !== '')
                .join('\n');
            
            setContent(htmlContent);
        } else {
            // No frontmatter, simple conversion
            const simpleHtml = aboutMd
                .replace(/^# (.*$)/gm, '<h1 class="text-6xl font-bold mb-8 text-white">$1</h1>')
                .replace(/^## (.*$)/gm, '<h2 class="text-3xl font-bold mb-6 mt-12 text-white">$1</h2>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
                .split('\n\n')
                .map(p => p.trim() ? `<p class="text-white/60 leading-relaxed text-lg mb-4">${p.trim()}</p>` : '')
                .filter(p => p !== '')
                .join('\n');
            
            setContent(simpleHtml);
        }
    }, []);

    return (
        <div className="max-w-3xl py-12">
            <article 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    );
};

export default About;
