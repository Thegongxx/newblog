
# Aura - Minimalist Personal Blog

Aura 是一个受苹果设计哲学启发的个人博客模板，具备流畅的动效、空间布局以及集成的 Gemini AI 助手。

## 🚀 快速部署 (GitHub Pages)

1. 将所有文件上传至 GitHub 仓库。
2. 进入仓库 **Settings > Pages**。
3. 将 **Branch** 设置为 `main` 并保存。
4. 等待几分钟，你的博客即可通过 GitHub 提供的 URL 访问。

## ✍️ 创作文章

所有的文章数据都存储在 `constants.tsx` 文件的 `BLOG_POSTS` 数组中。

### 添加文章步骤：
1. 准备一张封面图（推荐使用 Unsplash 链接）。
2. 在 `constants.tsx` 的 `BLOG_POSTS` 中添加新条目：
   ```typescript
   {
     id: 'unique-id',
     title: '文章标题',
     excerpt: '文章摘要...',
     category: '分类',
     date: '日期',
     readingTime: '阅读时长',
     image: '图片地址'
   }
   ```
3. 保存并推送到 GitHub，页面会自动更新。

## 🤖 AI 助手配置

本项目集成了 Google Gemini API。
- **环境要求**：需要 `process.env.API_KEY`。
- **自定义语气**：在 `services/geminiService.ts` 中修改 `systemInstruction` 来调整 AI 的个性和知识库。

---
Built with ❤️ using React & Gemini API.
