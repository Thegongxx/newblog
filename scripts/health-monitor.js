#!/usr/bin/env node

/**
 * 系统健康监控脚本
 * 检查 Obsidian → GitHub → Supabase → Vercel 闭环状态
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

// 健康检查结果
const healthStatus = {
  obsidian: { status: 'unknown', details: {} },
  github: { status: 'unknown', details: {} },
  supabase: { status: 'unknown', details: {} },
  vercel: { status: 'unknown', details: {} },
  sync: { status: 'unknown', details: {} }
};

// 检查 Obsidian 配置
function checkObsidian() {
  console.log('📝 检查 Obsidian 配置...');
  
  const obsidianConfig = path.join(__dirname, '../.obsidian');
  const contentDir = path.join(__dirname, '../content');
  
  const checks = {
    configExists: fs.existsSync(obsidianConfig),
    contentExists: fs.existsSync(contentDir),
    postsCount: 0,
    notesCount: 0
  };
  
  if (checks.contentExists) {
    const postsDir = path.join(contentDir, 'posts');
    const notesDir = path.join(contentDir, 'notes');
    
    if (fs.existsSync(postsDir)) {
      checks.postsCount = fs.readdirSync(postsDir).filter(f => f.endsWith('.md')).length;
    }
    
    if (fs.existsSync(notesDir)) {
      checks.notesCount = fs.readdirSync(notesDir).filter(f => f.endsWith('.md')).length;
    }
  }
  
  const isHealthy = checks.configExists && checks.contentExists && (checks.postsCount > 0 || checks.notesCount > 0);
  
  healthStatus.obsidian = {
    status: isHealthy ? 'healthy' : 'warning',
    details: checks
  };
  
  console.log(`   ${isHealthy ? '✅' : '⚠️'} Obsidian: ${checks.postsCount} 文章, ${checks.notesCount} 笔记`);
}

// 检查 GitHub 配置
function checkGitHub() {
  console.log('🐙 检查 GitHub 配置...');
  
  const gitDir = path.join(__dirname, '../.git');
  const workflowsDir = path.join(__dirname, '../.github/workflows');
  
  const checks = {
    gitRepo: fs.existsSync(gitDir),
    hasWorkflows: fs.existsSync(workflowsDir),
    workflowCount: 0
  };
  
  if (checks.hasWorkflows) {
    checks.workflowCount = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.yml')).length;
  }
  
  const isHealthy = checks.gitRepo && checks.hasWorkflows && checks.workflowCount > 0;
  
  healthStatus.github = {
    status: isHealthy ? 'healthy' : 'error',
    details: checks
  };
  
  console.log(`   ${isHealthy ? '✅' : '❌'} GitHub: ${checks.workflowCount} 工作流`);
}

// 检查 Supabase 连接
async function checkSupabase() {
  console.log('🗄️ 检查 Supabase 连接...');
  
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  
  const checks = {
    hasConfig: !!(supabaseUrl && supabaseKey),
    connection: false,
    tables: {},
    totalRecords: 0
  };
  
  if (checks.hasConfig) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // 测试连接并检查表
      const tables = ['posts', 'notes', 'likes', 'comments', 'homepage_comments'];
      
      for (const table of tables) {
        try {
          const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (!error) {
            checks.tables[table] = count || 0;
            checks.totalRecords += count || 0;
            checks.connection = true;
          } else {
            checks.tables[table] = `Error: ${error.message}`;
          }
        } catch (err) {
          checks.tables[table] = `Error: ${err.message}`;
        }
      }
    } catch (err) {
      checks.connection = false;
      checks.error = err.message;
    }
  }
  
  const isHealthy = checks.hasConfig && checks.connection;
  
  healthStatus.supabase = {
    status: isHealthy ? 'healthy' : 'error',
    details: checks
  };
  
  console.log(`   ${isHealthy ? '✅' : '❌'} Supabase: ${checks.totalRecords} 条记录`);
  
  if (isHealthy) {
    Object.entries(checks.tables).forEach(([table, count]) => {
      console.log(`      ${table}: ${count}`);
    });
  }
}

// 检查 Vercel 配置
function checkVercel() {
  console.log('🚀 检查 Vercel 配置...');
  
  const vercelConfig = path.join(__dirname, '../vercel.json');
  const packageJson = path.join(__dirname, '../package.json');
  
  const checks = {
    hasConfig: fs.existsSync(vercelConfig),
    hasPackageJson: fs.existsSync(packageJson),
    buildScript: false
  };
  
  if (checks.hasPackageJson) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
      checks.buildScript = !!(pkg.scripts && pkg.scripts.build);
    } catch (err) {
      checks.buildScript = false;
    }
  }
  
  const isHealthy = checks.hasConfig && checks.hasPackageJson && checks.buildScript;
  
  healthStatus.vercel = {
    status: isHealthy ? 'healthy' : 'warning',
    details: checks
  };
  
  console.log(`   ${isHealthy ? '✅' : '⚠️'} Vercel: 配置${checks.hasConfig ? '正常' : '缺失'}`);
}

// 检查同步状态
function checkSyncStatus() {
  console.log('🔄 检查同步状态...');
  
  const scriptsDir = path.join(__dirname, '../scripts');
  const backupsDir = path.join(__dirname, '../backups');
  
  const checks = {
    hasScripts: fs.existsSync(scriptsDir),
    scriptCount: 0,
    hasBackups: fs.existsSync(backupsDir),
    backupCount: 0,
    lastBackup: null
  };
  
  if (checks.hasScripts) {
    checks.scriptCount = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js')).length;
  }
  
  if (checks.hasBackups) {
    const backups = fs.readdirSync(backupsDir);
    checks.backupCount = backups.length;
    
    if (backups.length > 0) {
      const latestBackup = backups.sort().pop();
      const backupPath = path.join(backupsDir, latestBackup);
      const stats = fs.statSync(backupPath);
      checks.lastBackup = stats.mtime;
    }
  }
  
  const isHealthy = checks.hasScripts && checks.scriptCount >= 3;
  
  healthStatus.sync = {
    status: isHealthy ? 'healthy' : 'warning',
    details: checks
  };
  
  console.log(`   ${isHealthy ? '✅' : '⚠️'} 同步: ${checks.scriptCount} 脚本, ${checks.backupCount} 备份`);
  
  if (checks.lastBackup) {
    const hoursAgo = Math.floor((Date.now() - checks.lastBackup.getTime()) / (1000 * 60 * 60));
    console.log(`      最近备份: ${hoursAgo} 小时前`);
  }
}

// 生成健康报告
function generateHealthReport() {
  console.log('\n📊 系统健康报告');
  console.log('=' .repeat(50));
  
  const components = [
    { name: 'Obsidian', status: healthStatus.obsidian },
    { name: 'GitHub', status: healthStatus.github },
    { name: 'Supabase', status: healthStatus.supabase },
    { name: 'Vercel', status: healthStatus.vercel },
    { name: '同步系统', status: healthStatus.sync }
  ];
  
  let overallHealth = 'healthy';
  let healthyCount = 0;
  
  components.forEach(({ name, status }) => {
    const icon = status.status === 'healthy' ? '✅' : 
                 status.status === 'warning' ? '⚠️' : '❌';
    
    console.log(`${icon} ${name.padEnd(12)} ${status.status.toUpperCase()}`);
    
    if (status.status === 'healthy') healthyCount++;
    else if (status.status === 'error') overallHealth = 'error';
    else if (overallHealth === 'healthy') overallHealth = 'warning';
  });
  
  console.log('=' .repeat(50));
  
  const overallIcon = overallHealth === 'healthy' ? '🟢' : 
                      overallHealth === 'warning' ? '🟡' : '🔴';
  
  console.log(`${overallIcon} 整体状态: ${overallHealth.toUpperCase()} (${healthyCount}/${components.length})`);
  
  // 建议
  console.log('\n💡 优化建议:');
  
  if (healthStatus.obsidian.status !== 'healthy') {
    console.log('   📝 检查 Obsidian 配置和内容文件');
  }
  
  if (healthStatus.github.status !== 'healthy') {
    console.log('   🐙 确保 GitHub Actions 工作流配置正确');
  }
  
  if (healthStatus.supabase.status !== 'healthy') {
    console.log('   🗄️ 检查 Supabase 连接和环境变量');
  }
  
  if (healthStatus.vercel.status !== 'healthy') {
    console.log('   🚀 检查 Vercel 部署配置');
  }
  
  if (healthStatus.sync.status !== 'healthy') {
    console.log('   🔄 运行备份和同步脚本');
  }
  
  if (overallHealth === 'healthy') {
    console.log('   🎉 系统运行良好！建议定期运行健康检查');
  }
}

// 主监控函数
async function runHealthCheck() {
  console.log('🏥 Aura 系统健康检查\n');
  
  checkObsidian();
  checkGitHub();
  await checkSupabase();
  checkVercel();
  checkSyncStatus();
  
  generateHealthReport();
  
  console.log('\n🔗 闭环工作流状态:');
  console.log('   Obsidian → GitHub → Supabase → Vercel → 用户 → Supabase → Obsidian');
  
  const allHealthy = Object.values(healthStatus).every(s => s.status === 'healthy');
  console.log(`   ${allHealthy ? '🟢 完整闭环' : '🟡 部分连通'}`);
}

runHealthCheck().catch(console.error);