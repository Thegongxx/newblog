#!/usr/bin/env node

/**
 * 双向同步增强版 - 从Supabase拉取到Obsidian
 * 支持冲突检测、智能合并、实时通知
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
  console.error('❌ 缺少Supabase配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 生成增强的 frontmatter
function generateFrontmatter(data, type) {
  const lines = ['---'];
  
  if (type === 'post') {
    lines.push(`title: "${data.title}"`);
    lines.push(`slug: ${data.slug}`);
    if (data.excerpt) lines.push(`excerpt: "${data.excerpt}"`);
    if (data.category) lines.push(`category: ${data.category}`);
    if (data.cover_image) lines.push(`cover_image: ${data.cover_image}`);
    if (data.reading_time) lines.push(`reading_time: ${data.reading_time}`);
    lines.push(`published: ${data.published !== false}`);
    lines.push(`date: ${new Date(data.created_at).toISOString().split('T')[0]}`);
    if (data.author) lines.push(`author: ${data.author}`);
    lines.push(`updated: ${new Date(data.updated_at).toISOString().split('T')[0]}`);
  } else {
    lines.push(`title: "${data.title}"`);
    if (data.author) lines.push(`author: ${data.author}`);
    lines.push(`date: ${new Date(data.created_at).toISOString().split('T')[0]}`);
    lines.push(`updated: ${new Date(data.updated_at).toISOString().split('T')[0]}`);
    if (data.category) lines.push(`category: ${data.category}`);
    if (data.tags && data.tags.length > 0) {
      lines.push('tags:');
      data.tags.forEach(tag => lines.push(`  - ${tag}`));
    }
  }
  
  lines.push('---');
  return lines.join('\n');
}

// 检测本地文件状态
function getLocalFileInfo(filePath) {
  if (!fs.existsSync(filePath)) return null;
  
  const stats = fs.statSync(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // 简单解析 frontmatter 获取更新时间
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  let localUpdated = stats.mtime;
  
  if (match) {
    const updatedMatch = match[1].match(/updated:\s*(.+)/);
    if (updatedMatch) {
      localUpdated = new Date(updatedMatch[1]);
    }
  }
  
  return {
    mtime: stats.mtime,
    updated: localUpdated,
    exists: true
  };
}

// 智能写入文件
async function smartWriteFile(data, type, targetPath) {
  const localInfo = getLocalFileInfo(targetPath);
  const dbUpdated = new Date(data.updated_at);
  
  // 冲突检测
  if (localInfo && localInfo.updated > dbUpdated) {
    console.log(`⚠️ 冲突: ${data.title}`);
    console.log(`   本地: ${localInfo.updated.toISOString()}`);
    console.log(`   数据库: ${dbUpdated.toISOString()}`);
    
    // 创建冲突文件
    const conflictPath = targetPath.replace('.md', '.conflict.md');
    const frontmatter = generateFrontmatter(data, type);
    const content = `${frontmatter}\n\n${data.text || data.content || ''}`;
    fs.writeFileSync(conflictPath, content, 'utf-8');
    
    console.log(`   → 创建冲突文件: ${path.basename(conflictPath)}`);
    return { status: 'conflict', path: conflictPath };
  }
  
  // 正常写入
  const frontmatter = generateFrontmatter(data, type);
  const content = `${frontmatter}\n\n${data.text || data.content || ''}`;
  fs.writeFileSync(targetPath, content, 'utf-8');
  
  return { 
    status: localInfo ? 'updated' : 'created', 
    path: targetPath 
  };
}

// 拉取并写入文章
async function pullPosts() {
  console.log('📚 拉取文章...');
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('❌ 拉取文章失败:', error.message);
    return { success: 0, conflicts: 0, errors: 1 };
  }
  
  const postsDir = path.join(__dirname, '../content/posts');
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }
  
  const results = { success: 0, conflicts: 0, errors: 0 };
  
  for (const post of posts) {
    try {
      const filePath = path.join(postsDir, `${post.slug}.md`);
      const result = await smartWriteFile(post, 'post', filePath);
      
      if (result.status === 'conflict') {
        results.conflicts++;
      } else {
        results.success++;
        console.log(`✅ 文章: ${post.title}`);
      }
    } catch (err) {
      console.error(`❌ ${post.slug}: ${err.message}`);
      results.errors++;
    }
  }
  
  return results;
}

// 拉取并写入笔记
async function pullNotes() {
  console.log('📓 拉取笔记...');
  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('❌ 拉取笔记失败:', error.message);
    return { success: 0, conflicts: 0, errors: 1 };
  }
  
  const notesDir = path.join(__dirname, '../content/notes');
  if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir, { recursive: true });
  }
  
  const results = { success: 0, conflicts: 0, errors: 0 };
  
  for (const note of notes) {
    try {
      const filePath = path.join(notesDir, `${note.slug}.md`);
      const result = await smartWriteFile(note, 'note', filePath);
      
      if (result.status === 'conflict') {
        results.conflicts++;
      } else {
        results.success++;
        console.log(`✅ 笔记: ${note.title}`);
      }
    } catch (err) {
      console.error(`❌ ${note.slug}: ${err.message}`);
      results.errors++;
    }
  }
  
  return results;
}

// 检查新评论和点赞
async function checkInteractions() {
  console.log('💬 检查新互动...');
  
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24小时内
  
  // 检查新评论
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false });
  
  // 检查新点赞
  const { data: likes } = await supabase
    .from('likes')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false });
  
  if (comments?.length > 0) {
    console.log(`📝 新评论: ${comments.length} 条`);
    comments.forEach(comment => {
      console.log(`   "${comment.content.substring(0, 50)}..." - ${comment.author}`);
    });
  }
  
  if (likes?.length > 0) {
    console.log(`❤️ 新点赞: ${likes.length} 个`);
  }
  
  return { comments: comments?.length || 0, likes: likes?.length || 0 };
}

// 主拉取函数
async function enhancedPull() {
  console.log('🔄 增强双向同步开始...\n');
  
  const startTime = Date.now();
  
  // 拉取内容
  const postResults = await pullPosts();
  console.log('');
  const noteResults = await pullNotes();
  console.log('');
  
  // 检查互动
  const interactions = await checkInteractions();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // 生成报告
  console.log('\n📊 同步报告:');
  console.log(`   文章: ✅${postResults.success} ⚠️${postResults.conflicts} ❌${postResults.errors}`);
  console.log(`   笔记: ✅${noteResults.success} ⚠️${noteResults.conflicts} ❌${noteResults.errors}`);
  console.log(`   互动: 💬${interactions.comments} ❤️${interactions.likes}`);
  console.log(`   耗时: ${duration}s`);
  
  // 冲突处理建议
  const totalConflicts = postResults.conflicts + noteResults.conflicts;
  if (totalConflicts > 0) {
    console.log('\n⚠️ 发现冲突文件，请手动处理:');
    console.log('   1. 检查 .conflict.md 文件');
    console.log('   2. 合并内容后删除冲突文件');
    console.log('   3. 重新运行同步');
  }
  
  console.log('\n🎉 双向同步完成！');
  
  // 如果有新互动，提示用户
  if (interactions.comments > 0 || interactions.likes > 0) {
    console.log('\n🔔 有新的用户互动，建议查看网站！');
  }
}

enhancedPull().catch(console.error);