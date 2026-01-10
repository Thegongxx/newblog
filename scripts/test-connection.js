#!/usr/bin/env node

/**
 * 测试Supabase数据库连接
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
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env文件不存在');
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
  
  return envVars;
}

async function testConnection() {
  console.log('🔍 测试Supabase连接...\n');
  
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 缺少Supabase配置');
    console.log('请在.env文件中设置:');
    console.log('  VITE_SUPABASE_URL=你的项目URL');
    console.log('  VITE_SUPABASE_ANON_KEY=你的anon密钥');
    return;
  }
  
  console.log('📡 连接信息:');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);
  console.log('');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // 测试基本连接
    console.log('1️⃣ 测试基本连接...');
    const { data, error } = await supabase.from('posts').select('count').limit(1);
    
    if (error) {
      console.error('❌ 连接失败:', error.message);
      
      if (error.message.includes('relation "posts" does not exist')) {
        console.log('\n💡 posts表不存在，需要创建数据库表');
        console.log('请参考 docs/OBSIDIAN_SYNC_SETUP.md 中的数据库设置部分');
      }
      return;
    }
    
    console.log('✅ 连接成功!');
    
    // 测试查询posts表
    console.log('\n2️⃣ 测试posts表查询...');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, slug')
      .limit(5);
    
    if (postsError) {
      console.error('❌ 查询posts表失败:', postsError.message);
      return;
    }
    
    console.log(`✅ 找到 ${posts.length} 篇文章`);
    if (posts.length > 0) {
      console.log('📚 现有文章:');
      posts.forEach(post => {
        console.log(`   - ${post.title} (${post.slug})`);
      });
    } else {
      console.log('📝 数据库中暂无文章，可以运行同步脚本添加文章');
    }
    
    console.log('\n🎉 所有测试通过！');
    console.log('\n📋 下一步:');
    console.log('   1. 确保 content/posts/ 目录有Markdown文件');
    console.log('   2. 运行 npm run sync:posts 同步文章');
    console.log('   3. 启动开发服务器 npm run dev');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testConnection();