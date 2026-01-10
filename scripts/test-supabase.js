#!/usr/bin/env node

/**
 * 测试 Supabase 连接和配置
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取环境变量
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
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 测试 Supabase 配置...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少环境变量:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

console.log('✅ 环境变量配置正确');
console.log('📡 Supabase URL:', supabaseUrl);
console.log('🔑 API Key:', supabaseKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // 测试基本连接
    console.log('🔌 测试数据库连接...');
    const { data, error } = await supabase.from('posts').select('count').limit(1);
    
    if (error) {
      console.error('❌ 连接失败:', error.message);
      return false;
    }
    
    console.log('✅ 数据库连接成功\n');
    
    // 测试各个表
    const tables = ['posts', 'notes', 'likes', 'homepage_comments', 'comments'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.log(`❌ 表 ${table}: ${error.message}`);
        } else {
          console.log(`✅ 表 ${table}: 可访问`);
        }
      } catch (err) {
        console.log(`❌ 表 ${table}: ${err.message}`);
      }
    }
    
    console.log('\n🎉 Supabase 配置测试完成！');
    return true;
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    return false;
  }
}

testConnection().catch(console.error);