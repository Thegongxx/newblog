#!/usr/bin/env node

/**
 * 智能本地同步脚本 - 增强版
 * 支持冲突检测、时间戳比较、自动备份
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

// 创建备份
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../backups', timestamp);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // 备份 content 目录
  const contentDir = path.join(__dirname, '../content');
  if (fs.existsSync(contentDir)) {
    fs.cpSync(contentDir, path.join(backupDir, 'content'), { recursive: true });
    console.log(`📦 备份创建: ${backupDir}`);
  }
  
  return backupDir;
}

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

// 检测文件变化
function getFileStats(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const stats = fs.statSync(filePath);
  return {
    mtime: stats.mtime,
    size: stats.size
  };
}

// 智能同步单个文件
async function syncFile(filePath, type) {
  const fileName = path.basename(filePath, '.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  const { metadata, content: body } = parseFrontmatter(content);
  const fileStats = getFileStats(filePath);
  
  // 检查数据库中的记录
  const table = type === 'post' ? 'posts' : 'notes';
  const { data: existing } = await supabase
    .from(table)
    .select('*')
    .eq('slug', fileName)
    .single();
  
  const localTime = fileStats.mtime;
  const dbTime = existing ? new Date(existing.updated_at) : null;
  
  // 冲突检测
  if (existing && dbTime && localTime < dbTime) {
    console.log(`⚠️ 冲突检测: ${fileName}`);
    console.log(`   本地: ${localTime.toISOString()}`);
    console.log(`   数据库: ${dbTime.toISOString()}`);
    console.log(`   → 保留数据库版本（较新）`);
    return { status: 'conflict', action: 'keep_db' };
  }
  
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
    created_at: metadata.date ? new Date(metadata.date).toISOString() : (existing?.created_at || new Date().toISOString()),
    updated_at: new Date().toISOString()
  } : {
    slug: fileName,
    title: metadata.title || fileName,
    text: body,
    content: body,
    category: metadata.category || 'general',
    author: metadata.author || 'Aura',
    tags: Array.isArray(metadata.tags) ? metadata.tags : (metadata.tags ? [metadata.tags] : []),
    created_at: metadata.date ? new Date(metadata.date).toISOString() : (existing?.created_at || new Date().toISOString()),
    updated_at: new Date().toISOString()
  };
  
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

// 主同步函数
async function smartSync() {
  console.log('🚀 智能同步开始...\n');
  
  // 创建备份
  const backupPath = createBackup();
  
  const results = {
    posts: { success: 0, conflicts: 0, errors: 0 },
    notes: { success: 0, conflicts: 0, errors: 0 }
  };
  
  // 同步文章
  const postsDir = path.join(__dirname, '../content/posts');
  if (fs.existsSync(postsDir)) {
    const posts = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    console.log(`📚 同步文章: ${posts.length} 篇`);
    
    for (const file of posts) {
      const result = await syncFile(path.join(postsDir, file), 'post');
      if (result.status === 'success') results.posts.success++;
      else if (result.status === 'conflict') results.posts.conflicts++;
      else results.posts.errors++;
    }
  }
  
  console.log('');
  
  // 同步笔记
  const notesDir = path.join(__dirname, '../content/notes');
  if (fs.existsSync(notesDir)) {
    const notes = fs.readdirSync(notesDir).filter(f => f.endsWith('.md'));
    console.log(`📓 同步笔记: ${notes.length} 篇`);
    
    for (const file of notes) {
      const result = await syncFile(path.join(notesDir, file), 'note');
      if (result.status === 'success') results.notes.success++;
      else if (result.status === 'conflict') results.notes.conflicts++;
      else results.notes.errors++;
    }
  }
  
  // 生成报告
  console.log('\n📊 同步报告:');
  console.log(`   文章: ✅${results.posts.success} ⚠️${results.posts.conflicts} ❌${results.posts.errors}`);
  console.log(`   笔记: ✅${results.notes.success} ⚠️${results.notes.conflicts} ❌${results.notes.errors}`);
  console.log(`   备份: ${backupPath}`);
  
  console.log('\n🎉 智能同步完成！');
}

smartSync().catch(console.error);