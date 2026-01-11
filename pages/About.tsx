import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import aboutMd from '../content/pages/about.md?raw';

// 统一动画配置 - 与其他页面保持一致
const containerVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { 
            type: "tween",
            ease: [0.25, 0.1, 0.25, 1],
            duration: 0.4, 
            staggerChildren: 0.1 
        }
    }
};

const itemVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: { 
        x: 0,
        opacity: 1, 
        transition: { 
            type: "tween",
            ease: [0.25, 0.1, 0.25, 1],
            duration: 0.4 
        } 
    }
};

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
        <motion.div 
            className="max-w-3xl py-8 md:py-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.header className="mb-10 md:mb-16" variants={itemVariants}>
                <h1 className="text-4xl md:text-8xl font-bold tracking-tighter mb-4 md:mb-8 italic">ABOUT.</h1>
                <p className="text-base md:text-xl text-white/30 font-light max-w-lg">关于这个空间，关于我。</p>
            </motion.header>

            <motion.article 
                className="prose prose-invert max-w-none prose-p:text-sm prose-p:md:text-base prose-headings:text-lg prose-headings:md:text-xl"
                variants={itemVariants}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </motion.div>
    );
};

export default About;
