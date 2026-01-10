# Obsidian到Supabase同步设置指南

## 📋 概述

这个指南将帮助你设置从Obsidian Markdown文件到Supabase数据库的自动同步系统。

## 🔧 前置要求

1. **Supabase项目** - 你需要一个活跃的Supabase项目
2. **环境变量配置** - 需要配置数据库连接信息
3. **posts表结构** - 数据库中需要有正确的posts表

## 📊 数据库表结构

确保你的Supabase数据库中有以下posts表结构：

```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  html_content TEXT,
  excerpt TEXT,
  category TEXT DEFAULT 'uncategorized',
  cover_image TEXT,
  reading_time INTEGER DEFAULT 5,
  published BOOLEAN DEFAULT true,
  author TEXT DEFAULT 'Aura',
  views INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

## ⚙️ 环境变量配置

### 1. 本地开发环境

复制 `.env.example` 为 `.env` 并填入你的配置：

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 同步脚本需要的Service Role Key (仅本地开发使用)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. 获取Supabase密钥

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 Settings → API
4. 复制以下信息：
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **注意**: Service Role Key 拥有完全权限，请妥善保管，不要提交到Git仓库！

## 📝 Markdown文件格式

你的Obsidian文章需要包含frontmatter元数据：

```markdown
---
title: 文章标题
slug: article-slug
excerpt: 文章摘要描述
category: 技术
cover_image: https://example.com/image.jpg
reading_time: 5
published: true
date: 2024-01-12
author: Aura
---

# 文章标题

这里是文章内容...
```

### Frontmatter字段说明

- `title`: 文章标题 (必需)
- `slug`: URL友好的文章标识符 (可选，默认使用文件名)
- `excerpt`: 文章摘要 (可选)
- `category`: 文章分类 (可选，默认为'uncategorized')
- `cover_image`: 封面图片URL (可选)
- `reading_time`: 预计阅读时间(分钟) (可选，默认5)
- `published`: 是否发布 (可选，默认true)
- `date`: 发布日期 (可选，默认当前时间)
- `author`: 作者 (可选，默认'Aura')

## 🚀 同步方法

### 方法1: 手动同步 (本地开发)

```bash
# 同步所有文章到Supabase
npm run sync:posts
```

### 方法2: 自动同步 (GitHub Actions)

当你推送文章到GitHub时，会自动触发同步：

1. **设置GitHub Secrets**:
   - 进入你的GitHub仓库
   - Settings → Secrets and variables → Actions
   - 添加以下secrets:
     - `VITE_SUPABASE_URL`: 你的Supabase项目URL
     - `SUPABASE_SERVICE_ROLE_KEY`: 你的Service Role密钥

2. **推送文章**:
   ```bash
   git add content/posts/
   git commit -m "添加新文章"
   git push origin main
   ```

3. **查看同步状态**:
   - 进入GitHub仓库的Actions标签
   - 查看"同步文章到Supabase"工作流状态

## 📁 文件组织

```
content/
├── posts/              # 博客文章 (同步到Supabase)
│   ├── hello-world.md
│   ├── my-workflow.md
│   └── ...
└── notes/              # 日常笔记 (直接从文件系统读取)
    ├── daily-note.md
    ├── ideas.md
    └── ...
```

## 🔄 工作流程

1. **在Obsidian中写作** - 在 `content/posts/` 目录创建Markdown文件
2. **添加frontmatter** - 确保包含必要的元数据
3. **提交到Git** - 推送到GitHub仓库
4. **自动同步** - GitHub Actions自动将文章同步到Supabase
5. **网站更新** - Vercel自动部署，文章出现在网站上

## 🛠️ 故障排除

### 同步失败

1. **检查环境变量**:
   ```bash
   # 本地测试连接
   node -e "
   require('dotenv').config();
   console.log('URL:', process.env.VITE_SUPABASE_URL);
   console.log('Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
   "
   ```

2. **检查数据库表**:
   - 确保posts表存在
   - 检查表结构是否正确
   - 验证RLS策略设置

3. **检查文件格式**:
   - 确保Markdown文件有正确的frontmatter
   - 检查YAML语法是否正确

### 文章不显示

1. **检查published字段** - 确保设置为`true`
2. **检查数据库** - 在Supabase Dashboard中查看数据
3. **清除缓存** - 刷新浏览器缓存

### GitHub Actions失败

1. **检查Secrets** - 确保GitHub Secrets设置正确
2. **查看日志** - 在Actions标签查看详细错误信息
3. **手动触发** - 使用"workflow_dispatch"手动运行

## 📚 相关文档

- [Supabase文档](https://supabase.com/docs)
- [GitHub Actions文档](https://docs.github.com/en/actions)
- [Obsidian文档](https://help.obsidian.md/)

## 🎯 下一步

设置完成后，你就可以：

1. 在Obsidian中专注写作
2. 文章自动同步到数据库
3. 网站实时显示最新内容
4. 享受无缝的写作到发布体验！