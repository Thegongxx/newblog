# Xuan — 个人博客

基于 **React + Vite** 的单页应用，配合 **Supabase** 提供文章、笔记、互动与评论；支持用 **Obsidian** 编写 Markdown，并通过内置脚本与云端数据库双向同步。前端注重动效与阅读体验（Framer Motion、响应式布局、深浅主题等），默认部署配置面向 **Vercel**。

## 功能概览

- **文章流与归档**：已发布文章列表、按 slug 访问正文、归档页
- **笔记**：独立笔记流与详情（数据结构与文章区分）
- **互动**：点赞、评论区（数据来自 Supabase）
- **站点页**：关于页等静态内容
- **站内助手**：可选接入 NVIDIA API 的对话能力（需配置密钥）
- **内容工作流**：`content/posts`、`content/notes` 下的 Markdown（YAML Frontmatter）↔ Supabase 表的推送与拉取

## 技术栈

| 类别 | 选用 |
|------|------|
| 框架 | React 19、TypeScript |
| 构建 | Vite 6 |
| 样式 | Tailwind CSS |
| 路由 | React Router 7 |
| 数据与缓存 | Supabase JS、SWR |
| 动效 | Framer Motion |
| SEO | react-helmet-async |
| 测试 | Vitest、Testing Library |

## 本地开发

```bash
npm ci
npm run dev
```

开发服务器默认监听 **3000** 端口（见 `vite.config.ts`），可通过局域网访问（`host: 0.0.0.0`）。

```bash
npm run build    # 生产构建，输出 dist/
npm run preview  # 本地预览构建结果
npm run test     # 运行单元测试
```

## 环境变量

在项目根目录创建 `.env`（勿提交密钥；仓库应已忽略该文件）。

**前端 / Supabase（必填以正常读写数据）**

- `VITE_SUPABASE_URL` — Supabase 项目 URL  
- `VITE_SUPABASE_ANON_KEY` — 匿名公钥（浏览器端使用）

**同步脚本 `npm run sync`（写入数据库时需要更高权限）**

- `SUPABASE_SERVICE_ROLE_KEY` — 服务端密钥（仅本地或 CI 使用，勿暴露给前端）

**可选：站内 AI 助手**

- `VITE_NVIDIA_API_KEY`（或 `NVIDIA_API_KEY`）— 构建与 API 路由中会读取

## 内容与同步

Markdown 源文件目录（相对项目根目录）：

- `content/posts/` — 博文（文件名即 slug，如 `hello-world.md`）
- `content/notes/` — 笔记  
- `content/pages/` — 站内页面素材（如关于页来源，按现有路由与加载逻辑使用）

Frontmatter 常用字段包括 `title`、`date`、`category`、`published`（文章）等；脚本会将 Obsidian 风格语法（如 `![[图片]]`、`[[链接]]`）转换为 HTML 供帖子展示。

常用命令：

| 命令 | 说明 |
|------|------|
| `npm run sync` / `npm run push` | 本地 Markdown → Supabase（全量同步并清理库中已删除条目） |
| `npm run pull` | Supabase → 本地 Markdown |
| `npm run cleanup` | 清理常见临时/垃圾文件 |
| `npm run health` | 检查数据库与内容目录 |
| `npm run workflow:full` | cleanup + health + push |

数据库端需已创建与代码匹配的表（如 `posts`、`notes`、`likes`、评论相关表等），字段需与 `services/` 下 API 一致。

## 部署

仓库内含 `vercel.json`：构建命令 `npm run build`，输出目录 `dist`，并配置了 SPA 回退与静态资源缓存。将上述环境变量在 Vercel 项目设置中配置即可。

## 许可与说明

本项目为私有用途配置（`package.json` 中 `"private": true`）。若 fork 使用，请自行替换品牌文案、Supabase 项目与密钥策略。

声明本项目由AI辅助构建与开发
