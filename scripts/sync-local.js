#!/usr/bin/env node

/**
 * 本地开发环境同步脚本
 * 从.env文件读取配置，同步文章到Supabase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取.env文件
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env文件不存在，请先创建.env文件');
    console.log('📝 请复制.env.example为.env并填入正确的配置');
    process.exit(1);
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

// 设置环境变量
const env = loadEnv();
Object.keys(env).forEach(key => {
  process.env[key] = env[key];
});

// 检查必要的环境变量
if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 请在.env文件中设置以下变量:');
  console.log('   VITE_SUPABASE_URL=你的supabase项目URL');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=你的service role密钥');
  process.exit(1);
}

// 导入并运行同步脚本
import('./sync-posts.js');