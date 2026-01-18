#!/usr/bin/env node

/**
 * 同步Obsidian Markdown文件到Supabase数据库
 * 同步 posts 和 notes
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取.env文件
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf-8');
  const vars = {};
  content.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) vars[key.trim()] = val.trim();
  });
  return vars;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少必要的环境变量');
  console.error('需要: VITE_SUPABASE_URL 和 (SUPABASE_SERVICE_ROLE_KEY 或 VITE_SUPABASE_ANON_KEY)');
  console.log('💡 跳过同步步骤，继续构建...');
  process.exit(0); // 改为成功退出，不阻止部署
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n+/);
  if (!match) return { metadata: {}, content };

  const metadata = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let currentArray = null;

  for (const line of lines) {
    // 检查是否是数组项 (以 "  - " 开头)
    if (line.match(/^\s+-\s+/)) {
      if (currentKey && currentArray !== null) {
        currentArray.push(line.replace(/^\s+-\s+/, '').trim());
      }
      continue;
    }

    // 保存之前的数组
    if (currentKey && currentArray !== null) {
      metadata[currentKey] = currentArray;
      currentArray = null;
      currentKey = null;
    }

    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();

      // 检查是否是数组开始 (值为空，下一行是 - 开头)
      if (val === '') {
        currentKey = key;
        currentArray = [];
        continue;
      }

      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (!isNaN(Number(val)) && val !== '') val = Number(val);
      metadata[key] = val;
    }
  }

  // 保存最后一个数组
  if (currentKey && currentArray !== null) {
    metadata[currentKey] = currentArray;
  }

  return { metadata, content: content.slice(match[0].length) };
}

function markdownToHtml(md) {
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br>');
}

function parseTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return String(tags).split(',').map(t => t.trim()).filter(Boolean);
}

async function uploadImage(imagePath, postSlug) {
  if (!imagePath || imagePath.startsWith('http')) return imagePath;

  // 简化的本地图片检测与上传逻辑架子
  // 实际生产环境需要读取本地文件并调用 supabase.storage.from('blog-images').upload()
  console.log(`📸 检测到本地图片路径: ${imagePath}，准备上传 (当前版本保留原路径)`);
  return imagePath;
}

async function syncPost(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { metadata, content: body } = parseFrontmatter(content);
  const slug = fileName.replace('.md', '');

  // 处理封面图
  const coverImage = await uploadImage(metadata.cover_image, slug);

  const data = {
    slug, title: metadata.title || slug, content: body,
    html_content: markdownToHtml(body), excerpt: metadata.excerpt || '',
    category: metadata.category || null, cover_image: coverImage || '',
    reading_time: metadata.reading_time || 5, published: metadata.published !== false,
    author: metadata.author || 'Aura',
    created_at: metadata.date ? new Date(metadata.date).toISOString() : new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: existing } = await supabase.from('posts').select('id').eq('slug', slug).single();
  const { error } = existing
    ? await supabase.from('posts').update(data).eq('slug', slug)
    : await supabase.from('posts').insert([data]);

  console.log(error ? `❌ ${slug}: ${error.message}` : `✅ 文章: ${data.title}`);
}

async function syncNote(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { metadata, content: body } = parseFrontmatter(content);
  const slug = fileName.replace('.md', '');

  const data = {
    slug, title: metadata.title || slug, text: body, content: body,
    category: metadata.category || null, author: metadata.author || 'Aura',
    tags: parseTags(metadata.tags),
    created_at: metadata.date ? new Date(metadata.date).toISOString() : new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: existing } = await supabase.from('notes').select('id').eq('slug', slug).single();
  const { error } = existing
    ? await supabase.from('notes').update(data).eq('slug', slug)
    : await supabase.from('notes').insert([data]);

  console.log(error ? `❌ ${slug}: ${error.message}` : `✅ 笔记: ${data.title}`);
}

async function syncAll() {
  console.log('🚀 同步Obsidian到Supabase...\n');

  const postsDir = path.join(__dirname, '../content/posts');
  const notesDir = path.join(__dirname, '../content/notes');

  if (fs.existsSync(postsDir)) {
    const posts = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    console.log(`📚 文章: ${posts.length} 篇`);
    for (const f of posts) await syncPost(path.join(postsDir, f), f);
  }

  console.log('');

  if (fs.existsSync(notesDir)) {
    const notes = fs.readdirSync(notesDir).filter(f => f.endsWith('.md'));
    console.log(`📓 笔记: ${notes.length} 篇`);
    for (const f of notes) await syncNote(path.join(notesDir, f), f);
  }

  console.log('\n🎉 同步完成！');
}

syncAll().catch(console.error);