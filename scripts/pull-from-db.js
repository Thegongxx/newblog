#!/usr/bin/env node

/**
 * 从Supabase数据库拉取内容到本地Obsidian文件
 * 实现双向同步：Supabase → Obsidian
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取.env
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
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 生成Markdown frontmatter
function generateFrontmatter(data, type) {
  const lines = ['---'];
  
  if (type === 'post') {
    lines.push(`title: ${data.title}`);
    lines.push(`slug: ${data.slug}`);
    if (data.excerpt) lines.push(`excerpt: ${data.excerpt}`);
    if (data.category) lines.push(`category: ${data.category}`);
    if (data.cover_image) lines.push(`cover_image: ${data.cover_image}`);
    if (data.reading_time) lines.push(`reading_time: ${data.reading_time}`);
    lines.push(`published: ${data.published !== false}`);
    lines.push(`date: ${new Date(data.created_at).toISOString().split('T')[0]}`);
    if (data.author) lines.push(`author: ${data.author}`);
  } else {
    lines.push(`title: ${data.title}`);
    if (data.author) lines.push(`author: ${data.author}`);
    lines.push(`date: ${new Date(data.created_at).toISOString().split('T')[0]}`);
    if (data.category) lines.push(`category: ${data.category}`);
    if (data.tags && data.tags.length > 0) {
      lines.push(`tags: ${data.tags.join(', ')}`);
    }
  }
  
  lines.push('---');
  return lines.join('\n');
}

// 写入文章文件
async function writePost(post) {
  const postsDir = path.join(__dirname, '../content/posts');
  if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });
  
  const frontmatter = generateFrontmatter(post, 'post');
  const content = `${frontmatter}\n\n${post.content || ''}`;
  const filePath = path.join(postsDir, `${post.slug}.md`);
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ 文章: ${post.title}`);
}

// 写入笔记文件
async function writeNote(note) {
  const notesDir = path.join(__dirname, '../content/notes');
  if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir, { recursive: true });
  
  const frontmatter = generateFrontmatter(note, 'note');
  const content = `${frontmatter}\n\n${note.text || note.content || ''}`;
  const filePath = path.join(notesDir, `${note.slug}.md`);
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ 笔记: ${note.title}`);
}

async function pullAll() {
  console.log('🔄 从Supabase拉取数据到本地...\n');
  
  // 拉取文章
  console.log('📚 拉取文章...');
  const { data: posts, error: postsErr } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (postsErr) {
    console.error('❌ 拉取文章失败:', postsErr.message);
  } else {
    for (const post of posts) await writePost(post);
    console.log(`   共 ${posts.length} 篇\n`);
  }
  
  // 拉取笔记
  console.log('📓 拉取笔记...');
  const { data: notes, error: notesErr } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (notesErr) {
    console.error('❌ 拉取笔记失败:', notesErr.message);
  } else {
    for (const note of notes) await writeNote(note);
    console.log(`   共 ${notes.length} 篇\n`);
  }
  
  console.log('🎉 拉取完成！');
  console.log('\n📋 下一步:');
  console.log('   git add content/');
  console.log('   git commit -m "从数据库同步内容"');
  console.log('   git push');
}

pullAll().catch(console.error);