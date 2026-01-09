import { FileNote } from '../types';

// 简单的 Markdown Frontmatter 解析器 (避免引入 heavy libs)
function parseNote(fileName: string, rawContent: string): FileNote {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n+/;
    const match = rawContent.match(frontmatterRegex);

    let metadata: any = {};
    let content = rawContent;

    if (match) {
        const frontmatter = match[1];
        content = rawContent.slice(match[0].length).trim();

        // 简单的 YAML 解析
        frontmatter.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length) {
                metadata[key.trim()] = valueParts.join(':').trim();
            }
        });
    }

    // 如果没有 title，尝试从 filename 或 content 第一句生成
    const title = metadata.title || fileName.split('/').pop()?.replace('.md', '') || 'Untitled';

    // 提取标签 (默认加上 Note)
    const tags = metadata.tags ? metadata.tags.split(',').map((t: string) => t.trim()) : ['Note'];
    if (metadata.slug) tags.push(metadata.slug);

    return {
        id: metadata.slug || fileName.split('/').pop()?.replace('.md', '') || 'untitled',
        title: metadata.title || title,
        content: content,
        date: metadata.date || new Date().toLocaleDateString(),
        tags: tags
    };
}

// 使用 Vite 的 import.meta.glob 读取 content/notes 下的所有 md 文件
const notesModules = import.meta.glob('/content/notes/*.md', {
    query: '?raw',
    import: 'default',
    eager: true
}) as Record<string, string>;

export const getAllNotes = (): FileNote[] => {
    return Object.entries(notesModules).map(([path, content]) => {
        return parseNote(path, content);
    });
};
