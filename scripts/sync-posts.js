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

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 请设置 VITE_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n+/);
  if (!match) return { metadata: {}, content };
  
  const metadata = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (!isNaN(Number(val)) && val !== '') val = Number(val);
      metadata[key] = val;
    }
  });
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

async function syncPost(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { metadata, content: body } = parseFrontmatter(content);
  const slug = fileName.replace('.md', '');
  
  const data = {
    slug, title: metadata.title || slug, content: body,
    html_content: markdownToHtml(body), excerpt: metadata.excerpt || '',
    category: metadata.category || 'uncategorized', cover_image: metadata.cover_image || '',
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
    category: metadata.category || 'general', author: metadata.author || 'Aura',
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