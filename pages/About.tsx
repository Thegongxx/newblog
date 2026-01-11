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
            <motion.header 
                className="mb-10 md:mb-16 relative group cursor-default" 
                variants={itemVariants}
                // 桌面端专属：名片翻转效果
                whileHover={!window.matchMedia('(max-width: 768px)').matches ? {
                    scale: 1.02,
                    rotateY: 2,
                    transition: { 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30 
                    }
                } : {}}
            >
                {/* 桌面端专属：名片背景光效 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl" />
                
                {/* 桌面端专属：名片边框光晕 */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                
                <div className="relative z-10 p-6 md:p-8 rounded-xl border border-white/5 group-hover:border-white/20 transition-all duration-500 bg-white/[0.01] group-hover:bg-white/[0.03]">
                    <h1 className={`text-4xl md:text-8xl font-bold tracking-tighter mb-4 md:mb-8 italic transition-all duration-500 ${
                        'text-white group-hover:text-white/90 group-hover:tracking-wide'
                    }`}>
                        ABOUT.
                    </h1>
                    <p className={`text-base md:text-xl font-light max-w-lg transition-all duration-500 ${
                        'text-white/30 group-hover:text-white/50 group-hover:translate-x-2'
                    }`}>
                        关于这个空间，关于我。
                    </p>
                    
                    {/* 桌面端专属：装饰性元素 */}
                    <div className={`absolute top-4 right-4 w-2 h-2 rounded-full transition-all duration-500 ${
                        'bg-white/20 group-hover:bg-white/60 group-hover:scale-150'
                    }`} />
                    <div className={`absolute bottom-4 left-4 w-1 h-8 transition-all duration-500 ${
                        'bg-white/10 group-hover:bg-white/30 group-hover:h-12'
                    }`} />
                </div>
            </motion.header>

            <motion.article 
                className="prose prose-invert max-w-none prose-p:text-sm prose-p:md:text-base prose-headings:text-lg prose-headings:md:text-xl relative group"
                variants={itemVariants}
                dangerouslySetInnerHTML={{ __html: content }}
                // 桌面端专属：内容区域悬停效果
                whileHover={!window.matchMedia('(max-width: 768px)').matches ? {
                    y: -4,
                    transition: { 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 25 
                    }
                } : {}}
            />
        </motion.div>
    );
};

export default About;
