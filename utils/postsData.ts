// 预构建的文章数据，避免客户端文件系统访问
import { Post } from '../types';

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

### 列表测试
#### 无序列表
- 第一项
- 第二项
  - 嵌套项目
  - 另一个嵌套项目
- 第三项

#### 有序列表
1. 首先做这个
2. 然后做那个
3. 最后完成这个

### 代码块测试

\`\`\`javascript
// JavaScript代码示例
function greetWorld() {
    console.log('Hello, World!');
    return 'Welcome to my blog!';
}

greetWorld();
\`\`\`

\`\`\`css
/* CSS样式示例 */
.blog-post {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: 'Inter', sans-serif;
}

.blog-post h1 {
    color: #333;
    font-size: 2.5rem;
    margin-bottom: 1rem;
}
\`\`\`

### 引用测试

> "The best way to predict the future is to create it."
> 
> — Peter Drucker

### 链接测试
- [我的GitHub](https://github.com)
- [Obsidian官网](https://obsidian.md)
- [Vercel](https://vercel.com)

## 图片测试

![测试图片](https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600)

## 表格测试

| 功能 | 状态 | 说明 |
|------|------|------|
| Markdown渲染 | ✅ | 支持完整的Markdown语法 |
| 代码高亮 | ✅ | 支持多种编程语言 |
| 图片显示 | ✅ | 支持外部图片链接 |
| 评论系统 | ✅ | 独立的评论功能 |

## 技术栈

这个博客使用了以下技术：

- **前端**: React + TypeScript + Vite
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **数据库**: Supabase
- **部署**: Vercel
- **内容管理**: Obsidian + Git

## 测试目标

通过这篇文章，我们要验证：

1. ✅ Markdown文件能否正确解析
2. ✅ 文章能否在网站上正确显示
3. ✅ 评论功能是否正常工作
4. ✅ 响应式设计是否适配良好
5. ✅ 页面切换动画是否流畅

## 结语

如果你能看到这篇文章，说明整个工作流程运行正常！接下来可以开始创作更多有价值的内容了。

---

*这篇文章创建于 2024年1月12日，用于测试博客系统的各项功能。*`,
    html_content: '',
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

### 3. 强大的插件生态
- 丰富的社区插件
- 高度可定制化
- 满足各种特殊需求

## 我的文件组织结构

\`\`\`
content/
├── posts/          # 博客文章
├── notes/          # 日常笔记
├── pages/          # 静态页面
└── attachments/    # 图片和附件
\`\`\`

### 文章模板

我为博客文章创建了标准模板：

\`\`\`markdown
---
title: 文章标题
slug: url-slug
excerpt: 文章摘要
category: 分类
cover_image: 封面图片URL
reading_time: 预计阅读时间
published: true
date: YYYY-MM-DD
---

# 文章标题

文章内容...
\`\`\`

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

### 4. 发布流程
- 将文章移动到\`content/posts/\`目录
- 检查frontmatter格式
- 提交到Git仓库
- 自动部署到网站

## 实用插件推荐

### 核心插件
1. **Templates** - 文章模板管理
2. **Daily notes** - 每日笔记
3. **Graph view** - 知识图谱可视化
4. **Search** - 全文搜索

### 社区插件
1. **Calendar** - 日历视图
2. **Dataview** - 数据查询和展示
3. **Excalidraw** - 手绘图表
4. **Advanced Tables** - 表格编辑增强

## 知识管理策略

### MOC (Map of Content)
创建内容地图来组织相关主题：

- [[设计思考 MOC]]
- [[技术学习 MOC]]
- [[读书笔记 MOC]]
- [[项目管理 MOC]]

### 标签系统
使用层级标签进行分类：

\`\`\`
#技术/前端/React
#设计/UI/极简主义
#读书/心理学/认知科学
#项目/博客/功能开发
\`\`\`

### 定期回顾
- **每日回顾**: 整理当天的笔记
- **每周回顾**: 连接相关内容
- **每月回顾**: 提取可发布的文章

## 与博客系统的集成

### 自动化工作流
1. 在Obsidian中写作
2. Git提交推送
3. Vercel自动部署
4. 内容同步到数据库

### 内容同步
- 文章自动出现在博客首页
- 支持完整的Markdown语法
- 保持格式和样式一致

### 评论互动
- 读者可以在网站上评论
- 反馈帮助改进内容质量
- 形成良性的互动循环

## 写作技巧分享

### 1. 先写后编辑
- 不要在写作时过度编辑
- 先把想法记录下来
- 后续再优化语言和结构

### 2. 使用大纲
- 先列出文章大纲
- 逐步填充内容
- 保持逻辑清晰

### 3. 定期输出
- 设定写作目标
- 保持输出频率
- 质量比数量更重要

## 未来计划

### 功能增强
- [ ] 添加文章系列功能
- [ ] 实现标签页面
- [ ] 增加搜索功能
- [ ] 优化移动端体验

### 内容规划
- [ ] 技术教程系列
- [ ] 设计思考文章
- [ ] 工具使用指南
- [ ] 个人成长感悟

## 结语

Obsidian不仅仅是一个笔记工具，更是一个思考和创作的平台。通过合理的工作流程设计，它可以成为内容创作的强大引擎。

希望这篇文章能够帮助你建立自己的写作工作流程。如果你有任何问题或建议，欢迎在评论区交流！

---

*本文使用Obsidian编写，展示了从想法到发布的完整流程。*`,
    html_content: '',
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
- **Vue DevTools** 的重大更新

### 新兴框架崛起
- **Svelte/SvelteKit** - 编译时优化的先驱
- **Solid.js** - 细粒度响应式系统
- **Qwik** - 可恢复性架构的创新
- **Fresh** - Deno生态的全栈框架

## 🛠️ 开发工具革命

### 构建工具的进化

#### Vite生态系统
\`\`\`javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'esbuild'
  }
})
\`\`\`

#### 新一代打包器
- **Turbopack** - Vercel的Rust驱动打包器
- **esbuild** - Go语言的极速构建
- **Rollup 4** - 更好的Tree Shaking
- **Parcel 2** - 零配置的构建体验

### TypeScript的全面普及
TypeScript已经成为现代Web开发的标准：

\`\`\`typescript
// 类型安全的API调用
interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}
\`\`\`

## 🎨 CSS和样式技术

### CSS新特性
2024年值得关注的CSS新功能：

- **Container Queries** - 容器查询
- **CSS Cascade Layers** - 层叠层
- **CSS Subgrid** - 子网格布局
- **CSS Color Functions** - 新的颜色函数

### 样式解决方案
- **Tailwind CSS** 继续主导原子化CSS
- **CSS-in-JS** 向编译时方案转移
- **Vanilla Extract** 零运行时CSS-in-TS
- **Stitches** 类型安全的CSS-in-JS

## 🌐 全栈开发模式

### Meta框架的兴起
全栈框架成为主流选择：

| 框架 | 生态系统 | 特色功能 |
|------|----------|----------|
| Next.js | React | App Router, Server Actions |
| Nuxt | Vue | Auto-imports, Nitro Engine |
| SvelteKit | Svelte | File-based Routing |
| Remix | React | Nested Routing, Web Standards |

### 边缘计算的普及
- **Edge Functions** 成为标准配置
- **CDN边缘** 部署静态资源
- **全球分布式** 架构设计
- **低延迟** 用户体验

## 🔧 开发体验优化

### 开发者工具
- **GitHub Copilot** 和AI辅助编程
- **Storybook 7** 的组件驱动开发
- **Playwright** 端到端测试
- **Vitest** 快速单元测试

### 性能监控
\`\`\`javascript
// Web Vitals监控
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
\`\`\`

## 🔐 安全和隐私

### 安全最佳实践
- **Content Security Policy** 的严格实施
- **HTTPS Everywhere** 成为标准
- **依赖安全扫描** 自动化
- **零信任架构** 的应用

### 隐私保护
- **Cookie替代方案** 的探索
- **本地数据存储** 的重视
- **GDPR合规** 的自动化
- **用户数据控制** 的增强

## 📱 跨平台开发

### 移动端解决方案
- **React Native** 的新架构
- **Flutter Web** 的成熟
- **Ionic** 的持续创新
- **PWA** 功能的增强

### 桌面应用
- **Tauri** - Rust驱动的轻量级方案
- **Electron** 的性能优化
- **Web技术** 构建原生应用

## 🤖 AI和机器学习集成

### AI辅助开发
- **代码生成** 工具的普及
- **自动化测试** 的智能化
- **性能优化** 的AI建议
- **用户体验** 的个性化

### 前端ML
\`\`\`javascript
// TensorFlow.js示例
import * as tf from '@tensorflow/tfjs';

const model = await tf.loadLayersModel('/model.json');
const prediction = model.predict(inputData);
\`\`\`

## 🌍 可持续发展

### 绿色Web开发
- **碳足迹** 意识的提升
- **性能优化** 减少能耗
- **绿色托管** 服务的选择
- **可持续设计** 原则

### 可访问性
- **WCAG 2.2** 标准的实施
- **自动化测试** 工具
- **包容性设计** 的重视
- **语义化HTML** 的回归

## 🔮 未来展望

### 新兴技术
- **WebAssembly** 的更广泛应用
- **WebGPU** 带来的图形性能提升
- **Web Components** 的标准化
- **Import Maps** 的浏览器支持

### 开发模式变化
- **Micro-frontends** 架构的成熟
- **Jamstack** 的进一步发展
- **Serverless** 成为默认选择
- **Edge-first** 架构设计

## 总结

2024年的Web开发将更加注重：

1. **开发者体验** - 更快的构建、更好的工具
2. **用户体验** - 更快的加载、更流畅的交互
3. **可维护性** - 更好的类型安全、更清晰的架构
4. **可访问性** - 更包容的设计、更广泛的支持
5. **可持续性** - 更绿色的技术、更负责任的开发

作为Web开发者，保持学习和适应这些趋势将是我们持续成长的关键。

---

*这些趋势预测基于当前的技术发展轨迹和社区反馈，实际发展可能会有所不同。*`,
    html_content: '',
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
设计应该服务于功能，而不是相反：

\`\`\`css
/* 极简主义CSS示例 */
.button {
  /* 只保留必要的样式 */
  padding: 12px 24px;
  border: none;
  background: #000;
  color: #fff;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.button:hover {
  opacity: 0.8;
}
\`\`\`

### 3. 质量胜过数量
专注于做好少数几件事，而不是试图做所有事情。

## 🎨 视觉设计原则

### 色彩运用
极简主义设计通常采用有限的色彩调色板：

#### 单色调配色
- **黑白灰** - 经典的极简配色
- **单一色相** - 使用同一颜色的不同明度
- **自然色调** - 米色、象牙白、深灰

#### 强调色的使用
\`\`\`scss
// 极简配色方案
$primary: #000000;    // 主色
$secondary: #ffffff;  // 辅助色
$accent: #ff6b35;     // 强调色（谨慎使用）
$text: #333333;       // 文字色
$background: #fafafa; // 背景色
\`\`\`

### 排版设计
优秀的排版是极简设计的基础：

#### 字体选择
- **无衬线字体** - 现代、简洁
- **字体数量限制** - 最多使用2-3种字体
- **字重层次** - 通过字重创建视觉层次

#### 排版层次
\`\`\`css
/* 排版层次系统 */
h1 { font-size: 3rem; font-weight: 700; line-height: 1.2; }
h2 { font-size: 2.25rem; font-weight: 600; line-height: 1.3; }
h3 { font-size: 1.5rem; font-weight: 500; line-height: 1.4; }
body { font-size: 1rem; font-weight: 400; line-height: 1.6; }
\`\`\`

### 空间运用
留白是极简设计的灵魂：

- **呼吸空间** - 给元素足够的空间
- **视觉分组** - 通过空间创建内容分组
- **焦点引导** - 用空白引导用户注意力

## 🖥️ 数字产品中的应用

### 用户界面设计

#### 导航设计
\`\`\`jsx
// 极简导航组件
const Navigation = () => {
  return (
    <nav className="nav">
      <div className="nav-brand">LOGO</div>
      <ul className="nav-menu">
        <li><a href="/">首页</a></li>
        <li><a href="/about">关于</a></li>
        <li><a href="/contact">联系</a></li>
      </ul>
    </nav>
  );
};
\`\`\`

#### 表单设计
- **单列布局** - 减少视觉复杂度
- **清晰标签** - 简洁明了的字段标签
- **最少字段** - 只要求必要信息
- **即时反馈** - 简单的验证提示

### 交互设计

#### 微交互
极简的交互应该是：
- **直观的** - 符合用户预期
- **快速的** - 响应迅速
- **有意义的** - 每个动画都有目的

\`\`\`css
/* 简单的悬停效果 */
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
\`\`\`

## 📱 响应式极简设计

### 移动优先
极简设计天然适合移动端：

\`\`\`css
/* 移动优先的响应式设计 */
.container {
  padding: 1rem;
  max-width: 100%;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
    max-width: 768px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
    padding: 3rem;
  }
}
\`\`\`

### 内容优先
- **重要内容优先** - 确保核心信息在小屏幕上可见
- **渐进增强** - 在大屏幕上添加更多细节
- **触摸友好** - 足够大的点击区域

## 🧠 心理学原理

### 认知负荷理论
极简设计减少用户的认知负荷：

- **内在负荷** - 任务本身的复杂度
- **外在负荷** - 信息呈现方式的复杂度
- **相关负荷** - 处理和理解信息的心理努力

### 选择悖论
过多的选择会导致决策困难：

\`\`\`jsx
// 好的设计：有限的选择
const PricingPlans = () => {
  return (
    <div className="pricing">
      <div className="plan">基础版</div>
      <div className="plan featured">专业版</div>
      <div className="plan">企业版</div>
    </div>
  );
};
\`\`\`

## 🛠️ 实践指南

### 设计流程

#### 1. 定义核心目标
- 用户需要完成什么任务？
- 最重要的信息是什么？
- 如何简化用户的决策过程？

#### 2. 信息架构
\`\`\`
首页
├── 核心价值主张
├── 主要功能/服务
├── 社会证明
└── 行动号召
\`\`\`

#### 3. 视觉层次
- **主要元素** - 最大、最突出
- **次要元素** - 中等大小、适度突出
- **辅助元素** - 最小、低对比度

### 常见误区

#### ❌ 错误做法
- 认为极简就是空白
- 为了简洁而牺牲功能
- 忽视用户需求
- 过度简化导致不可用

#### ✅ 正确做法
- 简洁但不简单
- 功能完整但界面简洁
- 以用户为中心
- 简化复杂度而非功能

## 🌟 成功案例分析

### Apple
- **产品设计** - 简洁的外观，直观的操作
- **界面设计** - 清晰的层次，一致的交互
- **品牌传达** - 简单有力的信息传达

### Google
- **搜索页面** - 极简的界面，专注搜索功能
- **Material Design** - 简洁但富有表现力
- **产品哲学** - 让复杂的技术变得简单易用

## 🔮 未来趋势

### 技术驱动的极简
- **AI辅助设计** - 自动优化界面复杂度
- **个性化简化** - 根据用户习惯简化界面
- **语音交互** - 更自然的交互方式
- **手势控制** - 减少视觉界面元素

### 可持续设计
- **性能优化** - 简洁的代码，更快的加载
- **能耗考虑** - 减少不必要的动画和效果
- **可访问性** - 简洁的设计更容易访问

## 总结

极简主义设计不是一种风格，而是一种解决问题的方法。它要求我们：

1. **深入理解用户需求** - 知道什么是真正重要的
2. **勇于做减法** - 移除不必要的元素
3. **注重细节** - 在简洁中追求完美
4. **持续优化** - 不断简化和改进

真正的极简设计是经过深思熟虑的简洁，是复杂性的优雅解决方案。

---

*"Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away." — Antoine de Saint-Exupéry*`,
    html_content: '',
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