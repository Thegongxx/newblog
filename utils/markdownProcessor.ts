import { marked } from 'marked';

// 配置marked
marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false,
    mangle: false
});

// 简单的markdown到HTML转换
export function markdownToHtml(markdown: string): string {
    try {
        return marked(markdown);
    } catch (error) {
        console.error('Markdown conversion error:', error);
        return markdown; // 如果转换失败，返回原始markdown
    }
}

// 处理代码高亮的简单版本
export function processCodeBlocks(html: string): string {
    // 为代码块添加基本的样式类
    return html
        .replace(/<pre><code class="language-(\w+)">/g, '<pre class="hljs"><code class="language-$1 hljs">')
        .replace(/<pre><code>/g, '<pre class="hljs"><code class="hljs">');
}