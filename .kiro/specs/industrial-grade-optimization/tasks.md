# Implementation Plan: Industrial Grade Optimization

## Overview

将 Aura 博客升级为工业级 Web 应用的实施计划。按优先级分阶段实施：性能优化 → 稳定性增强 → 用户体验 → 开发效率。

## Tasks

- [x] 1. 测试基础设施搭建
  - [x] 1.1 安装测试依赖 (vitest, @testing-library/react, fast-check, jsdom)
    - 配置 package.json 测试脚本
    - _Requirements: 8.1_
  - [x] 1.2 创建 vitest.config.ts 配置文件
    - 配置 jsdom 环境、覆盖率阈值、setup 文件
    - _Requirements: 8.1, 8.5_
  - [x] 1.3 创建 tests/setup.ts 测试初始化文件
    - 配置全局 mock、测试工具函数
    - _Requirements: 8.4_

- [x] 2. 性能优化 - 路由懒加载
  - [x] 2.1 创建 routes/index.tsx 路由配置文件
    - 使用 React.lazy() 包装所有页面组件
    - 创建 LazyRoute 包装组件
    - _Requirements: 1.1, 1.2_
  - [x] 2.2 创建 components/LoadingFallback.tsx 加载占位组件
    - 实现骨架屏或 spinner 动画
    - _Requirements: 1.3_
  - [x] 2.3 重构 App.tsx 使用新路由配置
    - 移除直接 import，使用懒加载路由
    - 用 Suspense 包装路由出口
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 2.4 编写路由懒加载单元测试
    - 验证组件按需加载行为
    - _Requirements: 1.1, 1.2_

- [x] 3. 性能优化 - Vite 分包配置
  - [x] 3.1 更新 vite.config.ts 添加 rollupOptions
    - 配置 manualChunks 分离 vendor 依赖
    - 启用 cssCodeSplit
    - _Requirements: 2.1, 2.3, 2.4_
  - [x] 3.2 编写构建输出验证测试
    - **Property 13: Chunk Hash Stability**
    - **Validates: Requirements 2.2**

- [x] 4. 性能优化 - 数据缓存层
  - [x] 4.1 安装 SWR 依赖
    - npm install swr
    - _Requirements: 4.1_
  - [x] 4.2 创建 services/cacheService.ts
    - 实现 usePostsCache, useNotesCache, usePostCache hooks
    - 配置 TTL、revalidation 策略
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 4.3 重构 App.tsx 使用缓存 hooks
    - 替换直接 API 调用为 SWR hooks
    - _Requirements: 4.1, 4.5_
  - [x] 4.4 编写缓存属性测试
    - **Property 1: Cache-First Data Fetching**
    - **Property 2: Cache TTL Enforcement**
    - **Property 3: Stale-While-Revalidate Pattern**
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 5. Checkpoint - 性能优化验证
  - 运行构建，验证分包输出
  - 运行测试，确保缓存逻辑正确
  - 确保所有测试通过，如有问题请询问用户

- [x] 6. 稳定性增强 - 限流器
  - [x] 6.1 创建 services/rateLimiter.ts
    - 实现 RateLimiter 类
    - 导出 aiRateLimiter 单例
    - _Requirements: 10.4_
  - [x] 6.2 编写限流器属性测试
    - **Property 12: Rate Limiting Enforcement**
    - **Validates: Requirements 10.4**

- [x] 7. 稳定性增强 - AI 服务重试机制
  - [x] 7.1 重构 services/nvidiaService.ts
    - 添加 RetryConfig 接口
    - 实现指数退避重试逻辑
    - 集成限流器检查
    - _Requirements: 5.1, 5.5, 10.4_
  - [x] 7.2 更新 components/Assistant.tsx
    - 添加重试按钮 UI
    - 显示限流冷却提示
    - _Requirements: 5.2, 10.5_
  - [x] 7.3 编写 AI 服务属性测试
    - **Property 5: Exponential Backoff Retry**
    - **Property 6: Request Timeout Enforcement**
    - **Validates: Requirements 5.1, 5.5**

- [x] 8. 稳定性增强 - 日志服务
  - [x] 8.1 创建 services/logger.ts
    - 实现 Logger 类
    - 支持 debug/info/warn/error 级别
    - 实现批量发送逻辑
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - [x] 8.2 创建 api/logs.ts Serverless 函数
    - 接收日志批次
    - 存储到 Supabase 或输出到 Vercel Logs
    - _Requirements: 9.1_
  - [x] 8.3 编写日志服务属性测试
    - **Property 10: Error Context Capture**
    - **Property 11: Log Batching**
    - **Validates: Requirements 9.1, 9.2, 9.5**

- [x] 9. Checkpoint - 稳定性验证
  - 测试 AI 对话重试机制
  - 验证限流器工作正常
  - 确保所有测试通过，如有问题请询问用户

- [x] 10. 用户体验 - 响应式工具
  - [x] 10.1 创建 hooks/useResponsive.ts
    - 实现 useBreakpoint, useIsMobile hooks
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 10.2 编写响应式布局属性测试
    - **Property 8: Responsive Grid Layout**
    - **Validates: Requirements 7.1, 7.2, 7.3**

- [x] 11. 用户体验 - 动画性能优化
  - [x] 11.1 创建 hooks/useReducedMotion.ts
    - 检测系统减少动画偏好
    - 检测移动设备
    - _Requirements: 3.2_
  - [x] 11.2 更新动画组件使用 GPU 加速
    - 修改 App.tsx 导航栏动画
    - 修改 components/Assistant.tsx 动画
    - 使用 transform 替代 top/left
    - _Requirements: 3.1, 3.3, 3.4_
  - [x] 11.3 添加移动端动画降级
    - 在移动设备禁用鼠标跟踪效果
    - 降低 glassmorphism blur 强度
    - _Requirements: 3.2, 7.4_
  - [x] 11.4 编写移动端动画属性测试
    - **Property 9: Mobile Animation Optimization**
    - **Validates: Requirements 3.2**

- [x] 12. 用户体验 - Toast 通知系统
  - [x] 12.1 创建 components/Toast.tsx 和 ToastProvider
    - 实现 Toast 组件
    - 创建 useToast hook
    - 支持 success/error/info 类型
    - _Requirements: 6.3, 6.4_
  - [x] 12.2 集成 Toast 到 App.tsx
    - 替换现有简单 toast 实现
    - _Requirements: 6.3, 6.4_
  - [x] 12.3 编写 Toast 组件测试
    - **Property 7: Toast Notification Correctness**
    - **Validates: Requirements 6.3, 6.4**

- [x] 13. 用户体验 - 交互反馈增强
  - [x] 13.1 更新 components/LikeButton.tsx
    - 添加 loading 状态
    - 添加成功/失败反馈
    - _Requirements: 6.1_
  - [x] 13.2 更新 components/CommentSection.tsx
    - 添加提交进度指示器
    - 添加成功/失败反馈
    - _Requirements: 6.2_
  - [x] 13.3 更新 components/Assistant.tsx
    - 添加打字指示器动画
    - 添加骨架屏加载状态
    - _Requirements: 5.3, 6.5_
  - [x] 13.4 编写交互组件测试
    - 测试 loading 状态显示
    - 测试反馈消息显示
    - _Requirements: 6.1, 6.2_

- [x] 14. 用户体验 - 移动端导航
  - [x] 14.1 创建 components/MobileNav.tsx
    - 实现汉堡菜单按钮
    - 实现滑出式导航面板
    - _Requirements: 7.5_
  - [x] 14.2 更新 App.tsx 集成移动端导航
    - 根据 breakpoint 切换导航组件
    - _Requirements: 7.5_
  - [x] 14.3 编写移动端导航组件测试
    - 测试菜单展开/收起
    - _Requirements: 7.5_

- [x] 15. Checkpoint - 用户体验验证
  - 在不同设备尺寸测试响应式布局
  - 验证 Toast 通知正常工作
  - 确保所有测试通过，如有问题请询问用户

- [x] 16. 错误边界与全局错误处理
  - [x] 16.1 创建 components/ErrorBoundary.tsx
    - 实现 React Error Boundary
    - 集成 Logger 记录错误
    - _Requirements: 9.1_
  - [x] 16.2 创建 components/ErrorFallback.tsx
    - 实现用户友好的错误页面
    - 提供重试按钮
    - _Requirements: 5.2_
  - [x] 16.3 在 App.tsx 添加 ErrorBoundary
    - 包装主要路由区域
    - _Requirements: 9.1_

- [x] 17. Final Checkpoint - 全面验证
  - 运行完整测试套件
  - 验证代码覆盖率达到 70%
  - 运行生产构建，检查分包输出
  - 确保所有测试通过，如有问题请询问用户

## Notes

- 所有任务均为必须完成，确保工业级质量标准
- 每个 Checkpoint 是验证节点，确保阶段性成果稳定
- 属性测试使用 fast-check 库，每个测试运行 100 次迭代
- 所有测试文件放在 `tests/` 目录下，按类型分子目录
- 目标代码覆盖率：70%
