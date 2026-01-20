#!/usr/bin/env node

/**
 * Xuan 博客全能管理工具 (Xuan Tools v2.0)
 * 实现 Obsidian ↔ GitHub ↔ Supabase 的超流畅同步
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 基础配置 ---
function loadEnv() {
    const envPath = path.join(__dirname, '../.env');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf-8');
    const vars = {};
    content.split('\n').filter(line => line.trim() && !line.startsWith('#')).forEach(line => {
        const idx = line.indexOf('=');
        if (idx > 0) {
            const key = line.slice(0, idx).trim();
            const val = line.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
            vars[key] = val;
        }
    });
    return vars;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

// --- 通用工具 ---
function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n+/);
    if (!match) return { metadata: {}, content };
    const metadata = {};
    match[1].split('\n').forEach(line => {
        const idx = line.indexOf(':');
        if (idx > 0) {
            const key = line.slice(0, idx).trim();
            let val = line.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
            if (val === 'true') val = true;
            else if (val === 'false') val = false;
            else if (!isNaN(Number(val)) && val !== '') val = Number(val);
            metadata[key] = val;
        }
    });
    return { metadata, content: content.slice(match[0].length) };
}

function markdownToHtml(md) {
    if (!md) return '';
    let html = md.trim();

    // 1. 处理 Obsidian 双链图片 ![[image.jpg|300x200]] 或 ![[image.jpg|300]]
    html = html.replace(/!\[\[(.*?)\]\]/g, (match, content) => {
        const parts = content.split('|');
        const url = parts[0];
        const sizeInfo = parts[1];

        let style = '';
        if (sizeInfo) {
            if (sizeInfo.includes('x')) {
                const [w, h] = sizeInfo.split('x');
                style = `style="width: ${w}px; height: ${h}px; object-fit: cover;"`;
            } else if (!isNaN(sizeInfo)) {
                style = `style="width: ${sizeInfo}px; max-width: 100%;"`;
            }
        }
        return `<img src="${url}" alt="${url}" ${style} class="obsidian-img zoomable" />`;
    });

    // 2. 处理标准 Markdown 图片 ![alt](url)
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="standard-img zoomable" />');

    // 3. 处理双链文本 [[link|label]]
    html = html.replace(/\[\[(.*?)\]\]/g, (match, content) => {
        const [link, label] = content.split('|');
        return `<a href="${link}" class="obsidian-link underline decoration-white/20 hover:decoration-white/50 transition-all">${label || link}</a>`;
    });

    // 4. 常规 Markdown 语法
    html = html
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/`([^`]+)`/gim, '<code>$1</code>')
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/\n\n/gim, '</p><p>')
        .replace(/\n/gim, '<br>');

    // 5. 增强识别：如果文章开头就是一个封面图展示（通常是第一行），则强制将其从正文 HTML 中抹除
    // 以免它与侧边栏的封面重复。
    const imgStartTag = /^(<p>)?<img[^>]*class="[^"]*(obsidian|standard)-img[^"]*"[^>]*>(<\/p>)?/;
    if (imgStartTag.test(html)) {
        html = html.replace(imgStartTag, '').trim();
    }

    return html;
}

function generateFrontmatter(data, type) {
    const lines = ['---'];
    lines.push(`title: "${data.title}"`);
    lines.push(`author: "${data.author || 'Xuan'}"`);
    lines.push(`date: ${new Date(data.created_at || Date.now()).toISOString().split('T')[0]}`);
    if (type === 'post') {
        lines.push(`slug: ${data.slug}`);
        if (data.excerpt) lines.push(`excerpt: "${data.excerpt}"`);
        if (data.category) lines.push(`category: ${data.category}`);
        if (data.cover_image) lines.push(`cover_image: ${data.cover_image}`);
        if (data.reading_time) lines.push(`reading_time: ${data.reading_time}`);
        lines.push(`published: ${data.published !== false}`);
    } else {
        if (data.category) lines.push(`category: ${data.category}`);
        if (data.tags && data.tags.length > 0) {
            lines.push('tags:');
            data.tags.forEach(tag => lines.push(`  - ${tag}`));
        }
    }
    lines.push(`updated: ${new Date().toISOString().split('T')[0]}`);
    lines.push('---');
    return lines.join('\n');
}

// --- 核心功能: 同步 (Push to DB) ---
async function push() {
    if (!supabase) return console.error('❌ 缺少 Supabase 配置，无法同步');
    console.log('🚀 [Push] 开始全量同步 (Obsidian -> Supabase)...');

    const types = [
        { name: 'post', table: 'posts', dir: '../content/posts' },
        { name: 'note', table: 'notes', dir: '../content/notes' }
    ];

    for (const type of types) {
        const dirPath = path.join(__dirname, type.dir);
        if (!fs.existsSync(dirPath)) continue;

        const localFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
        const localSlugs = localFiles.map(f => f.replace('.md', ''));

        // 1. 上传/更新
        for (const file of localFiles) {
            const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
            const { metadata, content: body } = parseFrontmatter(content);
            const slug = file.replace('.md', '');

            const data = type.name === 'post' ? {
                slug, title: metadata.title || slug,
                content: markdownToHtml(body), // 存入渲染后的HTML供网页直接读取
                excerpt: metadata.excerpt || '', category: metadata.category || 'uncategorized',
                cover_image: metadata.cover_image || '', reading_time: metadata.reading_time || 5,
                published: metadata.published !== false, author: metadata.author || 'Xuan',
                created_at: metadata.date ? new Date(metadata.date).toISOString() : new Date().toISOString(),
                updated_at: new Date().toISOString()
            } : {
                slug, title: metadata.title || slug,
                text: body, content: body, // 笔记保持原样或双存
                category: metadata.category || 'general', author: metadata.author || 'Xuan',
                tags: Array.isArray(metadata.tags) ? metadata.tags : (metadata.tags ? [metadata.tags] : []),
                created_at: metadata.date ? new Date(metadata.date).toISOString() : new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data: existing } = await supabase.from(type.table).select('id').eq('slug', slug).single();
            const { error } = existing
                ? await supabase.from(type.table).update(data).eq('slug', slug)
                : await supabase.from(type.table).insert([data]);

            if (error) console.log(`   ❌ ${slug}: ${error.message}`);
            else console.log(`   ✅ ${type.name === 'post' ? '文章' : '笔记'}: ${data.title}`);
        }

        // 2. 删一个全删：清理数据库中已在本地删除的记录
        const { data: dbRecords } = await supabase.from(type.table).select('slug, title');
        const orphaned = (dbRecords || []).filter(r => !localSlugs.includes(r.slug));
        for (const record of orphaned) {
            await supabase.from(type.table).delete().eq('slug', record.slug);
            console.log(`   🗑️ 识别到本地已删除，同步清理数据库: ${record.title}`);
        }
    }
    console.log('✨ 推送同步完成！');
}

// --- 核心功能: 拉取 (Pull from DB) ---
async function pull() {
    if (!supabase) return console.error('❌ 缺少 Supabase 配置');
    console.log('🔄 [Pull] 开始拉取云端改动 (Supabase -> Obsidian)...');

    const types = [
        { name: 'post', table: 'posts', dir: '../content/posts' },
        { name: 'note', table: 'notes', dir: '../content/notes' }
    ];

    for (const type of types) {
        const dirPath = path.join(__dirname, type.dir);
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

        const { data: dbRecords, error } = await supabase.from(type.table).select('*');
        if (error) {
            console.log(`   ❌ 获取 ${type.table} 失败: ${error.message}`);
            continue;
        }

        for (const record of dbRecords) {
            const filePath = path.join(dirPath, `${record.slug}.md`);

            // 如果本地已有文件，且数据库里的 updated_at 并不比本地新，可以跳过 (简单逻辑)
            // 这里为了确保同步，直接生成内容并写入
            const frontmatter = generateFrontmatter(record, type.name);
            const content = `${frontmatter}\n\n${record.text || record.content || ''}`;

            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`   📥 已同步到本地: ${record.title}`);
        }
    }
    console.log('✨ 拉取同步完成！');
}

// --- 核心功能: 清理与健康检查 (保持原样) ---
function cleanup() {
    console.log('🧹 清理临时文件...');
    const patterns = ['.DS_Store', 'Thumbs.db', '.tmp', '.temp', '.log'];
    function walk(dir) {
        if (!fs.existsSync(dir) || dir.includes('node_modules') || dir.includes('.git')) return;
        fs.readdirSync(dir).forEach(item => {
            const p = path.join(dir, item);
            if (fs.statSync(p).isDirectory()) walk(p);
            else if (patterns.some(ext => item.endsWith(ext) || item === ext)) fs.unlinkSync(p);
        });
    }
    walk(path.join(__dirname, '..'));
    console.log('✅ 清理完成');
}

async function health() {
    console.log('🏥 系统健康检查...');
    const dbOk = supabase ? !(await supabase.from('posts').select('count', { head: true })).error : false;
    console.log(`${dbOk ? '✅' : '❌'} 数据库连接`);
    console.log(`${fs.existsSync(path.join(__dirname, '../content')) ? '✅' : '❌'} 本地内容目录`);
}

// --- CLI 逻辑 ---
const command = process.argv[2];
async function main() {
    switch (command) {
        case 'push': case 'sync': await push(); break;
        case 'pull': await pull(); break;
        case 'cleanup': cleanup(); break;
        case 'health': await health(); break;
        case 'all':
            cleanup();
            await health();
            await push();
            break;
        default:
            console.log('📖 Xuan Tools 使用说明:');
            console.log('   npm run sync      # 本地文件同步到数据库 (最常用)');
            console.log('   npm run pull      # 数据库改动拉取到本地');
            console.log('   npm run cleanup   # 清理垃圾');
    }
}

main().catch(console.error);
