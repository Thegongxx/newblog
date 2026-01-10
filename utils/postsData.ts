// 预构建的文章数据，避免客户端文件系统访问
import { Post } from '../types';

// 简单的markdown到HTML转换（不依赖外部库）
function simpleMarkdownToHtml(markdown: string): string {
  return markdown
    // 标题
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    // 行内代码
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
    // 换行
    .replace(/\n/gim, '<br>');
}

export const postsData: Post[] = [
  {
    id: 'hello-world',
    slug: 'hello-world',
    title: 'Hello World - 博客系统测试',
    content: `# Hello World - 博客系统测试

欢迎来到我的博客！这是第一篇测试文章，用来验证整个内容管理和发布流程。

## 工作流程测试

这篇文章将测试以下工作流程：

1. **Obsidian编写** - 在Obsidian中创建Markdown文件
2. **Git同步** - 提交到GitHub仓库
3. **自动部署** - Vercel自动部署更新
4. **数据库同步** - 内容同步到Supabase数据库

## Markdown功能测试

### 文本格式
- **粗体文本**
- *斜体文本*
- ~~删除线文本~~
- \`行内代码\`

### 代码块测试

\`\`\`javascript
// JavaScript代码示例
function greetWorld() {
    console.log('Hello, World!');
    return 'Welcome to my blog!';
}

greetWorld();
\`\`\`

### 引用测试

> "The best way to predict the future is to create it."
> 
> — Peter Drucker

## 技术栈

这个博客使用了以下技术：

- **前端**: React + TypeScript + Vite
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **数据库**: Supabase
- **部署**: Vercel
- **内容管理**: Obsidian + Git

## 结语

如果你能看到这篇文章，说明整个工作流程运行正常！接下来可以开始创作更多有价值的内容了。

---

*这篇文章创建于 2024年1月12日，用于测试博客系统的各项功能。*`,
    html_content: simpleMarkdownToHtml(`# Hello World - 博客系统测试

欢迎来到我的博客！这是第一篇测试文章，用来验证整个内容管理和发布流程。

## 工作流程测试

这篇文章将测试以下工作流程：

1. **Obsidian编写** - 在Obsidian中创建Markdown文件
2. **Git同步** - 提交到GitHub仓库
3. **自动部署** - Vercel自动部署更新
4. **数据库同步** - 内容同步到Supabase数据库

## Markdown功能测试

### 文本格式
- **粗体文本**
- *斜体文本*
- ~~删除线文本~~
- \`行内代码\`

### 代码块测试

\`\`\`javascript
// JavaScript代码示例
function greetWorld() {
    console.log('Hello, World!');
    return 'Welcome to my blog!';
}

greetWorld();
\`\`\`

### 引用测试

> "The best way to predict the future is to create it."
> 
> — Peter Drucker

## 技术栈

这个博客使用了以下技术：

- **前端**: React + TypeScript + Vite
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **数据库**: Supabase
- **部署**: Vercel
- **内容管理**: Obsidian + Git

## 结语

如果你能看到这篇文章，说明整个工作流程运行正常！接下来可以开始创作更多有价值的内容了。

---

*这篇文章创建于 2024年1月12日，用于测试博客系统的各项功能。*`),
    excerpt: '这是第一篇测试文章，用来验证从Obsidian到部署的完整工作流程。',
    category: '测试',
    cover_image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
    reading_time: 3,
    published: true,
    created_at: '2024-01-12T00:00:00.000Z',
    updated_at: '2024-01-12T00:00:00.000Z',
    views: 0,
    author: 'Aura'
  },
  {
    id: 'obsidian-workflow',
    slug: 'obsidian-workflow',
    title: '我的Obsidian写作工作流',
    content: `# 我的Obsidian写作工作流

作为一个热爱写作和知识管理的人，我一直在寻找最适合的工具。经过长时间的探索，我发现Obsidian是目前最符合我需求的解决方案。

## 为什么选择Obsidian？

### 1. 本地文件存储
- 所有笔记都是纯文本Markdown文件
- 完全掌控自己的数据
- 不依赖云服务，永远不会丢失

### 2. 双向链接
- 轻松建立知识之间的连接
- 自动生成知识图谱
- 发现意想不到的关联

## 写作工作流程

### 1. 灵感捕获
- 使用Quick Switcher快速创建笔记
- 先记录想法，不考虑格式
- 使用标签系统分类

### 2. 内容整理
- 定期回顾和整理笔记
- 使用双向链接连接相关内容
- 逐步完善和扩展想法

### 3. 文章创作
- 从笔记中提取有价值的内容
- 使用模板确保格式一致
- 在Obsidian中完成初稿

## 结语

Obsidian不仅仅是一个笔记工具，更是一个思考和创作的平台。通过合理的工作流程设计，它可以成为内容创作的强大引擎。

希望这篇文章能够帮助你建立自己的写作工作流程。如果你有任何问题或建议，欢迎在评论区交流！

---

*本文使用Obsidian编写，展示了从想法到发布的完整流程。*`,
    html_content: simpleMarkdownToHtml(`# 我的Obsidian写作工作流

作为一个热爱写作和知识管理的人，我一直在寻找最适合的工具。经过长时间的探索，我发现Obsidian是目前最符合我需求的解决方案。

## 为什么选择Obsidian？

### 1. 本地文件存储
- 所有笔记都是纯文本Markdown文件
- 完全掌控自己的数据
- 不依赖云服务，永远不会丢失

### 2. 双向链接
- 轻松建立知识之间的连接
- 自动生成知识图谱
- 发现意想不到的关联

## 写作工作流程

### 1. 灵感捕获
- 使用Quick Switcher快速创建笔记
- 先记录想法，不考虑格式
- 使用标签系统分类

### 2. 内容整理
- 定期回顾和整理笔记
- 使用双向链接连接相关内容
- 逐步完善和扩展想法

### 3. 文章创作
- 从笔记中提取有价值的内容
- 使用模板确保格式一致
- 在Obsidian中完成初稿

## 结语

Obsidian不仅仅是一个笔记工具，更是一个思考和创作的平台。通过合理的工作流程设计，它可以成为内容创作的强大引擎。

希望这篇文章能够帮助你建立自己的写作工作流程。如果你有任何问题或建议，欢迎在评论区交流！

---

*本文使用Obsidian编写，展示了从想法到发布的完整流程。*`),
    excerpt: '分享如何使用Obsidian进行高效的写作和知识管理，以及与博客系统的完美集成。',
    category: '工具',
    cover_image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800',
    reading_time: 5,
    published: true,
    created_at: '2024-01-12T00:00:00.000Z',
    updated_at: '2024-01-12T00:00:00.000Z',
    views: 0,
    author: 'Aura'
  },
  {
    id: 'web-development-trends-2024',
    slug: 'web-development-trends-2024',
    title: '2024年Web开发趋势预测',
    content: `# 2024年Web开发趋势预测

随着技术的快速发展，Web开发领域每年都会出现新的趋势和变化。让我们来看看2024年值得关注的主要趋势。

## 🚀 框架和库的演进

### React生态系统
React继续保持其在前端框架中的领导地位，2024年的主要发展方向：

- **React Server Components** 成为主流
- **Concurrent Features** 的广泛应用
- **Next.js 14+** 带来的性能提升
- **React Compiler** 的正式发布

### Vue.js的持续创新
Vue 3生态系统日趋成熟：

- **Composition API** 成为标准写法
- **Pinia** 替代Vuex成为状态管理首选
- **Nuxt 3** 提供更好的全栈开发体验

## 🛠️ 开发工具革命

### 构建工具的进化
- **Turbopack** - Vercel的Rust驱动打包器
- **esbuild** - Go语言的极速构建
- **Rollup 4** - 更好的Tree Shaking

### TypeScript的全面普及
TypeScript已经成为现代Web开发的标准。

## 总结

2024年的Web开发将更加注重：

1. **开发者体验** - 更快的构建、更好的工具
2. **用户体验** - 更快的加载、更流畅的交互
3. **可维护性** - 更好的类型安全、更清晰的架构

作为Web开发者，保持学习和适应这些趋势将是我们持续成长的关键。

---

*这些趋势预测基于当前的技术发展轨迹和社区反馈，实际发展可能会有所不同。*`,
    html_content: simpleMarkdownToHtml(`# 2024年Web开发趋势预测

随着技术的快速发展，Web开发领域每年都会出现新的趋势和变化。让我们来看看2024年值得关注的主要趋势。

## 🚀 框架和库的演进

### React生态系统
React继续保持其在前端框架中的领导地位，2024年的主要发展方向：

- **React Server Components** 成为主流
- **Concurrent Features** 的广泛应用
- **Next.js 14+** 带来的性能提升
- **React Compiler** 的正式发布

### Vue.js的持续创新
Vue 3生态系统日趋成熟：

- **Composition API** 成为标准写法
- **Pinia** 替代Vuex成为状态管理首选
- **Nuxt 3** 提供更好的全栈开发体验

## 🛠️ 开发工具革命

### 构建工具的进化
- **Turbopack** - Vercel的Rust驱动打包器
- **esbuild** - Go语言的极速构建
- **Rollup 4** - 更好的Tree Shaking

### TypeScript的全面普及
TypeScript已经成为现代Web开发的标准。

## 总结

2024年的Web开发将更加注重：

1. **开发者体验** - 更快的构建、更好的工具
2. **用户体验** - 更快的加载、更流畅的交互
3. **可维护性** - 更好的类型安全、更清晰的架构

作为Web开发者，保持学习和适应这些趋势将是我们持续成长的关键。

---

*这些趋势预测基于当前的技术发展轨迹和社区反馈，实际发展可能会有所不同。*`),
    excerpt: '探讨2024年Web开发领域的主要趋势，包括新兴技术、框架演进和开发模式的变化。',
    category: '技术',
    cover_image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
    reading_time: 7,
    published: true,
    created_at: '2024-01-12T00:00:00.000Z',
    updated_at: '2024-01-12T00:00:00.000Z',
    views: 0,
    author: 'Aura'
  },
  {
    id: 'minimalist-design-philosophy',
    slug: 'minimalist-design-philosophy',
    title: '极简主义设计哲学',
    content: `# 极简主义设计哲学

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci

在这个信息爆炸的时代，极简主义设计不仅仅是一种美学选择，更是一种解决复杂性的哲学思考。

## 🎯 极简主义的核心原则

### 1. 少即是多 (Less is More)
这是极简主义最著名的原则，由建筑师密斯·凡·德·罗提出：

- **去除冗余** - 移除不必要的装饰和元素
- **突出本质** - 让核心功能和内容更加突出
- **创造空间** - 留白不是空白，而是设计的一部分
- **减少认知负担** - 简化用户的思考过程

### 2. 功能至上 (Form Follows Function)
设计应该服务于功能，而不是相反。

### 3. 质量胜过数量
专注于做好少数几件事，而不是试图做所有事情。

## 🎨 视觉设计原则

### 色彩运用
极简主义设计通常采用有限的色彩调色板：

- **黑白灰** - 经典的极简配色
- **单一色相** - 使用同一颜色的不同明度
- **自然色调** - 米色、象牙白、深灰

### 排版设计
优秀的排版是极简设计的基础：

- **无衬线字体** - 现代、简洁
- **字体数量限制** - 最多使用2-3种字体
- **字重层次** - 通过字重创建视觉层次

## 总结

极简主义设计不是一种风格，而是一种解决问题的方法。它要求我们：

1. **深入理解用户需求** - 知道什么是真正重要的
2. **勇于做减法** - 移除不必要的元素
3. **注重细节** - 在简洁中追求完美
4. **持续优化** - 不断简化和改进

真正的极简设计是经过深思熟虑的简洁，是复杂性的优雅解决方案。

---

*"Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away." — Antoine de Saint-Exupéry*`,
    html_content: simpleMarkdownToHtml(`# 极简主义设计哲学

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci

在这个信息爆炸的时代，极简主义设计不仅仅是一种美学选择，更是一种解决复杂性的哲学思考。

## 🎯 极简主义的核心原则

### 1. 少即是多 (Less is More)
这是极简主义最著名的原则，由建筑师密斯·凡·德·罗提出：

- **去除冗余** - 移除不必要的装饰和元素
- **突出本质** - 让核心功能和内容更加突出
- **创造空间** - 留白不是空白，而是设计的一部分
- **减少认知负担** - 简化用户的思考过程

### 2. 功能至上 (Form Follows Function)
设计应该服务于功能，而不是相反。

### 3. 质量胜过数量
专注于做好少数几件事，而不是试图做所有事情。

## 🎨 视觉设计原则

### 色彩运用
极简主义设计通常采用有限的色彩调色板：

- **黑白灰** - 经典的极简配色
- **单一色相** - 使用同一颜色的不同明度
- **自然色调** - 米色、象牙白、深灰

### 排版设计
优秀的排版是极简设计的基础：

- **无衬线字体** - 现代、简洁
- **字体数量限制** - 最多使用2-3种字体
- **字重层次** - 通过字重创建视觉层次

## 总结

极简主义设计不是一种风格，而是一种解决问题的方法。它要求我们：

1. **深入理解用户需求** - 知道什么是真正重要的
2. **勇于做减法** - 移除不必要的元素
3. **注重细节** - 在简洁中追求完美
4. **持续优化** - 不断简化和改进

真正的极简设计是经过深思熟虑的简洁，是复杂性的优雅解决方案。

---

*"Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away." — Antoine de Saint-Exupéry*`),
    excerpt: '深入探讨极简主义设计的核心理念，以及如何在数字产品中实践这一设计哲学。',
    category: '设计',
    cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    reading_time: 6,
    published: true,
    created_at: '2024-01-12T00:00:00.000Z',
    updated_at: '2024-01-12T00:00:00.000Z',
    views: 0,
    author: 'Aura'
  }
];