# 🔄 Aura 项目工作流闭环图

## 📊 完整工作流树状图

```
🌟 Aura 极简主义个人空间
│
├── 📝 内容创作层
│   ├── 📓 Obsidian (本地创作)
│   │   ├── 📄 Markdown 文件编写
│   │   ├── 🏷️ 标签管理
│   │   ├── 🔗 双向链接
│   │   └── 📁 文件夹结构
│   │
│   └── 💾 本地存储
│       ├── 📂 content/posts/*.md
│       ├── 📂 content/notes/*.md
│       └── 🖼️ 图片资源
│
├── 🔄 同步传输层
│   ├── 📤 推送到云端
│   │   ├── 🐙 GitHub Repository
│   │   │   ├── 📋 版本控制
│   │   │   ├── 🔀 分支管理
│   │   │   └── 📝 提交历史
│   │   │
│   │   └── ⚡ Vercel 自动部署
│   │       ├── 🚀 CI/CD 流水线
│   │       ├── 🌐 静态站点生成
│   │       └── 📡 CDN 分发
│   │
│   └── 📥 拉取到数据库
│       ├── 🔧 scripts/sync-posts.js
│       ├── 🔧 scripts/pull-from-db.js
│       └── 🔧 scripts/sync-local.js
│
├── 🗄️ 数据存储层
│   ├── 🐘 Supabase PostgreSQL
│   │   ├── 📊 posts 表
│   │   │   ├── id, title, content
│   │   │   ├── category, tags
│   │   │   ├── created_at, updated_at
│   │   │   └── views, likes_count
│   │   │
│   │   ├── 📝 notes 表
│   │   │   ├── id, title, text
│   │   │   ├── author, slug
│   │   │   └── created_at, likes_count
│   │   │
│   │   ├── ❤️ likes 表
│   │   │   ├── target_type, target_id
│   │   │   ├── user_fingerprint
│   │   │   ├── count (单内容最多5次)
│   │   │   └── created_at
│   │   │
│   │   └── 💬 comments 表
│   │       ├── post_id/note_id
│   │       ├── author, email, content
│   │       ├── parent_id (嵌套回复)
│   │       └── approved, created_at
│   │
│   └── 🔐 权限管理
│       ├── 🛡️ RLS (Row Level Security)
│       ├── 🔑 API Keys
│       └── 🚫 访问控制
│
├── 🎨 前端展示层
│   ├── ⚛️ React + TypeScript
│   │   ├── 📱 响应式设计
│   │   ├── 🎭 Framer Motion 动画
│   │   ├── 🎨 Tailwind CSS 样式
│   │   └── 🔄 SWR 数据缓存
│   │
│   ├── 🧩 核心组件
│   │   ├── 📄 BlogCard (文章卡片)
│   │   ├── 📝 NoteDetail (笔记详情)
│   │   ├── ❤️ LikeButton (点赞按钮)
│   │   ├── 💬 CommentSection (评论区)
│   │   └── 🤖 Assistant (AI助手)
│   │
│   └── 📱 页面路由
│       ├── 🏠 Feed (首页)
│       ├── 📝 Notes (笔记列表)
│       ├── 📄 PostDetail (文章详情)
│       ├── 📄 NoteDetail (笔记详情)
│       ├── 📚 Archive (归档)
│       └── ℹ️ About (关于)
│
├── 🔧 自动化脚本层
│   ├── 📤 同步脚本
│   │   ├── sync-posts.js (推送到数据库)
│   │   ├── pull-from-db.js (从数据库拉取)
│   │   └── sync-local.js (本地同步)
│   │
│   ├── 🏥 健康监控
│   │   ├── health-monitor.js
│   │   ├── test-connection.js
│   │   └── cleanup.js
│   │
│   └── 🧪 测试脚本
│       ├── test-supabase.js
│       └── vitest 单元测试
│
└── 🚀 部署运维层
    ├── ☁️ Vercel 托管
    │   ├── 🌐 全球 CDN
    │   ├── 🔄 自动部署
    │   ├── 📊 性能监控
    │   └── 🔧 环境变量管理
    │
    ├── 🐘 Supabase 云服务
    │   ├── 🗄️ 数据库托管
    │   ├── 🔐 身份验证
    │   ├── 📡 实时订阅
    │   └── 📊 API 管理
    │
    └── 🔄 CI/CD 流水线
        ├── 🐙 GitHub Actions
        ├── 📦 自动构建
        ├── 🧪 自动测试
        └── 🚀 自动部署
```

## 🔄 数据流向图

```
📝 Obsidian 创作
    ↓ (本地编辑)
📂 本地 Markdown 文件
    ↓ (Git 推送)
🐙 GitHub Repository
    ↓ (Webhook 触发)
⚡ Vercel 自动部署
    ↓ (脚本执行)
🐘 Supabase 数据库
    ↓ (API 查询)
⚛️ React 前端展示
    ↓ (用户交互)
❤️ 点赞/评论数据
    ↓ (实时更新)
🐘 Supabase 数据库
    ↓ (双向同步)
📂 本地文件更新
```

## 🎯 核心特性闭环

### 📝 内容管理闭环
1. **Obsidian** → 本地创作和编辑
2. **GitHub** → 版本控制和备份
3. **Supabase** → 云端存储和管理
4. **前端** → 用户友好的展示

### 💾 数据同步闭环
1. **本地 → 云端**: `sync-posts.js` 推送内容
2. **云端 → 本地**: `pull-from-db.js` 拉取更新
3. **双向同步**: 保持数据一致性
4. **冲突解决**: 智能合并策略

### 🎨 用户体验闭环
1. **响应式设计** → 多设备适配
2. **动画效果** → Google Material Design
3. **交互反馈** → 点赞、评论、分享
4. **性能优化** → 缓存、懒加载、预取

### 🔧 开发运维闭环
1. **本地开发** → Vite 热重载
2. **代码提交** → GitHub 版本控制
3. **自动部署** → Vercel CI/CD
4. **监控维护** → 健康检查脚本

## 🛠️ 技术栈总览

| 层级 | 技术选型 | 作用 |
|------|----------|------|
| 📝 创作 | Obsidian + Markdown | 内容创作和管理 |
| 🔄 同步 | GitHub + Git | 版本控制和协作 |
| 🗄️ 存储 | Supabase PostgreSQL | 云端数据库 |
| 🎨 前端 | React + TypeScript | 用户界面 |
| 🎭 动画 | Framer Motion | 交互动效 |
| 🎨 样式 | Tailwind CSS | 响应式设计 |
| 🚀 部署 | Vercel | 静态站点托管 |
| 🔧 脚本 | Node.js | 自动化工具 |

这个工作流实现了从内容创作到用户体验的完整闭环，确保了数据的一致性、开发的效率和用户的满意度！ 🎉