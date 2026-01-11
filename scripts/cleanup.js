#!/usr/bin/env node

/**
 * 自动化清理脚本
 * 清理重复文件、过期备份、优化工作流
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 清理统计
const cleanupStats = {
  duplicates: 0,
  backups: 0,
  temp: 0,
  conflicts: 0,
  size: 0
};

// 获取文件大小
function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

// 格式化文件大小
function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// 清理重复的 .obsidian 配置
function cleanupObsidianDuplicates() {
  console.log('🧹 清理重复的 Obsidian 配置...');
  
  const contentDir = path.join(__dirname, '../content');
  const rootObsidian = path.join(__dirname, '../.obsidian');
  
  if (!fs.existsSync(rootObsidian)) {
    console.log('   ⚠️ 根目录缺少 .obsidian 配置');
    return;
  }
  
  // 查找并删除子目录中的 .obsidian
  function findAndRemoveObsidian(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        if (item === '.obsidian' && dir !== path.dirname(rootObsidian)) {
          // 计算大小
          const size = getDirSize(itemPath);
          cleanupStats.size += size;
          cleanupStats.duplicates++;
          
          // 删除重复配置
          fs.rmSync(itemPath, { recursive: true, force: true });
          console.log(`   ✅ 删除: ${path.relative(__dirname, itemPath)} (${formatSize(size)})`);
        } else {
          findAndRemoveObsidian(itemPath);
        }
      }
    }
  }
  
  findAndRemoveObsidian(contentDir);
}

// 获取目录大小
function getDirSize(dirPath) {
  let size = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        size += getDirSize(itemPath);
      } else {
        size += stats.size;
      }
    }
  } catch {
    // 忽略错误
  }
  
  return size;
}

// 清理过期备份
function cleanupOldBackups() {
  console.log('🗂️ 清理过期备份...');
  
  const backupsDir = path.join(__dirname, '../backups');
  
  if (!fs.existsSync(backupsDir)) {
    console.log('   📁 创建备份目录');
    fs.mkdirSync(backupsDir, { recursive: true });
    return;
  }
  
  const backups = fs.readdirSync(backupsDir);
  const now = Date.now();
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30天
  
  for (const backup of backups) {
    const backupPath = path.join(backupsDir, backup);
    const stats = fs.statSync(backupPath);
    
    if (stats.isDirectory() && (now - stats.mtime.getTime()) > maxAge) {
      const size = getDirSize(backupPath);
      cleanupStats.size += size;
      cleanupStats.backups++;
      
      fs.rmSync(backupPath, { recursive: true, force: true });
      console.log(`   ✅ 删除过期备份: ${backup} (${formatSize(size)})`);
    }
  }
  
  // 保留最近的5个备份
  const recentBackups = backups
    .map(name => ({
      name,
      path: path.join(backupsDir, name),
      mtime: fs.statSync(path.join(backupsDir, name)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime);
  
  if (recentBackups.length > 5) {
    const toDelete = recentBackups.slice(5);
    
    for (const backup of toDelete) {
      if (fs.existsSync(backup.path)) {
        const size = getDirSize(backup.path);
        cleanupStats.size += size;
        cleanupStats.backups++;
        
        fs.rmSync(backup.path, { recursive: true, force: true });
        console.log(`   ✅ 删除多余备份: ${backup.name} (${formatSize(size)})`);
      }
    }
  }
}

// 清理临时文件
function cleanupTempFiles() {
  console.log('🧽 清理临时文件...');
  
  const patterns = [
    '**/*.tmp',
    '**/*.temp',
    '**/.DS_Store',
    '**/Thumbs.db',
    '**/*.log',
    '**/node_modules/.cache/**'
  ];
  
  function cleanPattern(dir, pattern) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        cleanPattern(itemPath, pattern);
      } else {
        // 简单的模式匹配
        if (pattern.includes(item) || 
            (pattern.includes('.DS_Store') && item === '.DS_Store') ||
            (pattern.includes('Thumbs.db') && item === 'Thumbs.db') ||
            (pattern.includes('.tmp') && item.endsWith('.tmp')) ||
            (pattern.includes('.temp') && item.endsWith('.temp')) ||
            (pattern.includes('.log') && item.endsWith('.log'))) {
          
          const size = stats.size;
          cleanupStats.size += size;
          cleanupStats.temp++;
          
          fs.unlinkSync(itemPath);
          console.log(`   ✅ 删除临时文件: ${path.relative(__dirname, itemPath)} (${formatSize(size)})`);
        }
      }
    }
  }
  
  const rootDir = path.join(__dirname, '..');
  cleanPattern(rootDir, '.DS_Store');
  cleanPattern(rootDir, 'Thumbs.db');
  cleanPattern(rootDir, '.tmp');
  cleanPattern(rootDir, '.temp');
  cleanPattern(rootDir, '.log');
}

// 清理冲突文件
function cleanupConflictFiles() {
  console.log('⚔️ 清理冲突文件...');
  
  const contentDir = path.join(__dirname, '../content');
  
  function findConflicts(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        findConflicts(itemPath);
      } else if (item.includes('.conflict.')) {
        const size = stats.size;
        cleanupStats.size += size;
        cleanupStats.conflicts++;
        
        console.log(`   ⚠️ 发现冲突文件: ${path.relative(__dirname, itemPath)}`);
        console.log(`      请手动处理后删除，或运行: rm "${itemPath}"`);
      }
    }
  }
  
  findConflicts(contentDir);
}

// 优化 package.json 脚本
function optimizePackageScripts() {
  console.log('📦 优化 package.json 脚本...');
  
  const packagePath = path.join(__dirname, '../package.json');
  
  if (!fs.existsSync(packagePath)) {
    console.log('   ❌ package.json 不存在');
    return;
  }
  
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  // 建议的脚本
  const recommendedScripts = {
    'sync:push': 'node scripts/sync-local.js',
    'sync:pull': 'node scripts/pull-from-db.js',
    'health': 'node scripts/health-monitor.js',
    'cleanup': 'node scripts/cleanup.js',
    'workflow:test': 'npm run health && npm run test',
    'workflow:sync': 'npm run sync:push && npm run sync:pull'
  };
  
  let updated = false;
  
  for (const [script, command] of Object.entries(recommendedScripts)) {
    if (!pkg.scripts[script]) {
      pkg.scripts[script] = command;
      updated = true;
      console.log(`   ✅ 添加脚本: ${script}`);
    }
  }
  
  if (updated) {
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2), 'utf-8');
    console.log('   📝 package.json 已更新');
  } else {
    console.log('   ✅ 脚本配置已是最新');
  }
}

// 生成清理报告
function generateCleanupReport() {
  console.log('\n📊 清理报告');
  console.log('=' .repeat(40));
  console.log(`🗑️ 重复配置: ${cleanupStats.duplicates} 个`);
  console.log(`📦 过期备份: ${cleanupStats.backups} 个`);
  console.log(`🧽 临时文件: ${cleanupStats.temp} 个`);
  console.log(`⚔️ 冲突文件: ${cleanupStats.conflicts} 个`);
  console.log(`💾 释放空间: ${formatSize(cleanupStats.size)}`);
  console.log('=' .repeat(40));
  
  const totalItems = cleanupStats.duplicates + cleanupStats.backups + cleanupStats.temp;
  
  if (totalItems > 0) {
    console.log(`🎉 清理完成！删除 ${totalItems} 个文件，释放 ${formatSize(cleanupStats.size)} 空间`);
  } else {
    console.log('✨ 系统已经很干净了！');
  }
  
  if (cleanupStats.conflicts > 0) {
    console.log(`\n⚠️ 发现 ${cleanupStats.conflicts} 个冲突文件，请手动处理`);
  }
}

// 主清理函数
async function runCleanup() {
  console.log('🧹 Aura 系统清理开始\n');
  
  cleanupObsidianDuplicates();
  cleanupOldBackups();
  cleanupTempFiles();
  cleanupConflictFiles();
  optimizePackageScripts();
  
  generateCleanupReport();
  
  console.log('\n💡 建议定期运行:');
  console.log('   npm run cleanup    # 系统清理');
  console.log('   npm run health     # 健康检查');
  console.log('   npm run sync:pull  # 同步更新');
}

runCleanup().catch(console.error);