#!/usr/bin/env node

/**
 * 增强同步脚本 - 支持删除检测和清理
 * 解决 Obsidian 删除文件后网站仍显示的问题
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 环境配置
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
  console.log('⚠️ Supabase配置缺失，跳过同步');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 解析 frontmatter
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n+/);
  if (!match) return { metadata: {}, content };
  
  const metadata = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (!isNaN(Number(val)) && val !== '') val = Number(val);
      metadata[key] = val;
    }
  }
  
  return { metadata, content: content.slice(match[0].length) };
}

// 获取本地文件列表
function getLocalFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
}

// 获取数据库中的记录
async function getDbRecords(table) {
  const { data, error } = await supabase
    .from(table)
    .select('slug, title');
  
  if (error) {
    console.error(`❌ 获取${table}记录失败:`, error.message);
    return [];
  }
  
  return data || [];
}

// 同步单个文件
async function syncFile(filePath, type) {
  const fileName = path.basename(filePath, '.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  const { metadata, content: body } = parseFrontmatter(content);
  
  const table = type === 'post' ? 'posts' : 'notes';
  
  // 准备数据
  const data = type === 'post' ? {
    slug: fileName,
    title: metadata.title || fileName,
    content: body,
    excerpt: metadata.excerpt || '',
    category: metadata.category || 'uncategorized',
    cover_image: metadata.cover_image || '',
    reading_time: metadata.reading_time || 5,
    published: metadata.published !== false,
    author: metadata.author || 'Aura',
    created_at: metadata.date ? new Date(metadata.date).toISOString() : new Date().toISOString(),
    updated_at: new Date().toISOString()
  } : {
    slug: fileName,
    title: metadata.title || fileName,
    text: body,
    content: body,
    category: metadata.category || 'general',
    author: metadata.author || 'Aura',
    tags: Array.isArray(metadata.tags) ? metadata.tags : (metadata.tags ? [metadata.tags] : []),
    created_at: metadata.date ? new Date(metadata.date).toISOString() : new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // 检查是否存在
  const { data: existing } = await supabase
    .from(table)
    .select('id')
    .eq('slug', fileName)
    .single();
  
  // 执行同步
  const { error } = existing 
    ? await supabase.from(table).update(data).eq('slug', fileName)
    : await supabase.from(table).insert([data]);
  
  if (error) {
    console.log(`❌ ${fileName}: ${error.message}`);
    return { status: 'error', error: error.message };
  }
  
  console.log(`✅ ${type === 'post' ? '文章' : '笔记'}: ${data.title}`);
  return { status: 'success', action: existing ? 'updated' : 'created' };
}

// 删除数据库中的孤立记录
async function cleanupOrphanedRecords(localSlugs, dbRecords, table, type) {
  const orphaned = dbRecords.filter(record => !localSlugs.includes(record.slug));
  
  if (orphaned.length === 0) {
    console.log(`✅ ${type}: 无需清理`);
    return { deleted: 0 };
  }
  
  console.log(`🧹 发现 ${orphaned.length} 个孤立的${type}记录:`);
  
  let deleted = 0;
  for (const record of orphaned) {
    console.log(`   - ${record.title} (${record.slug})`);
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('slug', record.slug);
    
    if (error) {
      console.log(`   ❌ 删除失败: ${error.message}`);
    } else {
      console.log(`   ✅ 已删除`);
      deleted++;
    }
  }
  
  return { deleted };
}

// 主同步函数
async function syncWithCleanup() {
  console.log('🚀 增强同步开始 (支持删除检测)...\n');
  
  const results = {
    posts: { synced: 0, deleted: 0, errors: 0 },
    notes: { synced: 0, deleted: 0, errors: 0 }
  };
  
  // === 同步文章 ===
  console.log('📚 处理文章...');
  const postsDir = path.join(__dirname, '../content/posts');
  const localPosts = getLocalFiles(postsDir);
  const dbPosts = await getDbRecords('posts');
  
  console.log(`   本地文章: ${localPosts.length} 篇`);
  console.log(`   数据库文章: ${dbPosts.length} 篇`);
  
  // 同步本地文章到数据库
  if (fs.existsSync(postsDir)) {
    const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    for (const file of postFiles) {
      const result = await syncFile(path.join(postsDir, file), 'post');
      if (result.status === 'success') results.posts.synced++;
      else results.posts.errors++;
    }
  }
  
  // 清理孤立的文章记录
  const postCleanup = await cleanupOrphanedRecords(localPosts, dbPosts, 'posts', '文章');
  results.posts.deleted = postCleanup.deleted;
  
  console.log('');
  
  // === 同步笔记 ===
  console.log('📓 处理笔记...');
  const notesDir = path.join(__dirname, '../content/notes');
  const localNotes = getLocalFiles(notesDir);
  const dbNotes = await getDbRecords('notes');
  
  console.log(`   本地笔记: ${localNotes.length} 篇`);
  console.log(`   数据库笔记: ${dbNotes.length} 篇`);
  
  // 同步本地笔记到数据库
  if (fs.existsSync(notesDir)) {
    const noteFiles = fs.readdirSync(notesDir).filter(f => f.endsWith('.md'));
    for (const file of noteFiles) {
      const result = await syncFile(path.join(notesDir, file), 'note');
      if (result.status === 'success') results.notes.synced++;
      else results.notes.errors++;
    }
  }
  
  // 清理孤立的笔记记录
  const noteCleanup = await cleanupOrphanedRecords(localNotes, dbNotes, 'notes', '笔记');
  results.notes.deleted = noteCleanup.deleted;
  
  // 生成报告
  console.log('\n📊 同步报告:');
  console.log(`   文章: ✅${results.posts.synced} 🗑️${results.posts.deleted} ❌${results.posts.errors}`);
  console.log(`   笔记: ✅${results.notes.synced} 🗑️${results.notes.deleted} ❌${results.notes.errors}`);
  
  const totalDeleted = results.posts.deleted + results.notes.deleted;
  if (totalDeleted > 0) {
    console.log(`\n🎉 成功清理了 ${totalDeleted} 个孤立记录！`);
    console.log('   现在网站内容与 Obsidian 完全同步了');
  }
  
  console.log('\n✨ 增强同步完成！');
}

syncWithCleanup().catch(console.error);