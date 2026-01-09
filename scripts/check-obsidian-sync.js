#!/usr/bin/env node

/**
 * Obsidian 同步检查脚本
 * 检查 content 目录下的 Markdown 文件格式是否正确
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, '../content');

function checkMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    
    console.log(`\n📄 检查文件: ${fileName}`);
    
    // 检查是否有 frontmatter
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
    const hasFrontmatter = frontmatterRegex.test(content);
    
    if (hasFrontmatter) {
        console.log('✅ 包含 frontmatter');
        
        // 解析 frontmatter
        const match = content.match(frontmatterRegex);
        const frontmatter = match[1];
        const metadata = {};
        
        frontmatter.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length) {
                metadata[key.trim()] = valueParts.join(':').trim();
            }
        });
        
        console.log('📋 元数据:', metadata);
        
        // 检查内容长度
        const mainContent = content.slice(match[0].length).trim();
        console.log(`📝 内容长度: ${mainContent.length} 字符`);
        
        if (mainContent.length === 0) {
            console.log('⚠️  警告: 文件内容为空');
        }
    } else {
        console.log('❌ 缺少 frontmatter');
        console.log(`📝 原始内容长度: ${content.length} 字符`);
        
        if (content.trim().length === 0) {
            console.log('⚠️  警告: 文件为空');
        }
    }
}

function scanDirectory(dir, type) {
    console.log(`\n🔍 扫描 ${type} 目录: ${dir}`);
    
    if (!fs.existsSync(dir)) {
        console.log(`❌ 目录不存在: ${dir}`);
        return;
    }
    
    const files = fs.readdirSync(dir)
        .filter(file => file.endsWith('.md') && !file.startsWith('.'))
        .map(file => path.join(dir, file));
    
    console.log(`📁 找到 ${files.length} 个 Markdown 文件`);
    
    files.forEach(checkMarkdownFile);
}

function main() {
    console.log('🚀 开始检查 Obsidian 同步状态...');
    
    // 检查各个目录
    scanDirectory(path.join(contentDir, 'posts'), 'Posts');
    scanDirectory(path.join(contentDir, 'notes'), 'Notes');
    scanDirectory(path.join(contentDir, 'pages'), 'Pages');
    
    console.log('\n✨ 检查完成！');
    console.log('\n📖 Obsidian 同步指南:');
    console.log('1. 确保所有 .md 文件都有正确的 frontmatter');
    console.log('2. Posts 需要: title, slug, date, category, published, excerpt, cover_image');
    console.log('3. Notes 需要: author, date, tags');
    console.log('4. Pages 需要: title, slug, date, published');
    console.log('5. 提交到 GitHub 后，Vercel 会自动部署');
}

main();