#!/usr/bin/env node

/**
 * 同步Obsidian Markdown文件到Supabase数据库
 * 使用方法: node scripts/sync-posts.js
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从环境变量读取Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 需要service role key来绕过RLS

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 请设置 VITE_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 解析Markdown frontmatter
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n+/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { metadata: {}, content: content };
  }
  
  const frontmatter = match[1];
  const bodyContent = content.slice(match[0].length);
  
  const metadata = {};
  frontmatter.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      
      // 处理不同类型的值
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(Number(value)) && value !== '') value = Number(value);
      
      metadata[key] = value;
    }
  });
  
  return { metadata, content: bodyContent };
}

// 简单的Markdown到HTML转换
function markdownToHtml(markdown) {
  return markdown
    // 标题
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // 行内代码
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
    // 代码块
    .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
    // 引用
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    // 列表
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
    // 换行
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br>');
}

// 同步单个文章
async function syncPost(filePath, fileName) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { metadata, content: bodyContent } = parseFrontmatter(content);
    
    const slug = fileName.replace('.md', '');
    const htmlContent = markdownToHtml(bodyContent);
    
    const postData = {
      slug,
      title: metadata.title || slug,
      content: bodyContent,
      html_content: htmlContent,
      excerpt: metadata.excerpt || '',
      category: metadata.category || 'uncategorized',
      cover_image: metadata.cover_image || '',
      reading_time: metadata.reading_time || 5,
      published: metadata.published !== false,
      author: metadata.author || 'Aura',
      created_at: metadata.date ? new Date(metadata.date).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 检查文章是否已存在
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (existingPost) {
      // 更新现有文章
      const { error } = await supabase
        .from('posts')
        .update(postData)
        .eq('slug', slug);
      
      if (error) {
        console.error(`❌ 更新文章失败 ${slug}:`, error.message);
      } else {
        console.log(`✅ 更新文章: ${postData.title}`);
      }
    } else {
      // 创建新文章
      const { error } = await supabase
        .from('posts')
        .insert([postData]);
      
      if (error) {
        console.error(`❌ 创建文章失败 ${slug}:`, error.message);
      } else {
        console.log(`✅ 创建文章: ${postData.title}`);
      }
    }
  } catch (error) {
    console.error(`❌ 处理文件失败 ${fileName}:`, error.message);
  }
}

// 主同步函数
async function syncAllPosts() {
  console.log('🚀 开始同步Obsidian文章到Supabase...\n');
  
  const postsDir = path.join(__dirname, '../content/posts');
  
  if (!fs.existsSync(postsDir)) {
    console.error('❌ content/posts 目录不存在');
    return;
  }
  
  const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
  
  if (files.length === 0) {
    console.log('📝 没有找到Markdown文件');
    return;
  }
  
  console.log(`📚 找到 ${files.length} 个Markdown文件\n`);
  
  for (const file of files) {
    const filePath = path.join(postsDir, file);
    await syncPost(filePath, file);
  }
  
  console.log('\n🎉 同步完成！');
}

// 运行同步
syncAllPosts().catch(console.error);