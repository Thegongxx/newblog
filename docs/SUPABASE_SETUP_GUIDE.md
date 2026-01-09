# Supabase Notes 评论系统设置指南

## 🚀 快速设置步骤

### 1. 打开 Supabase SQL Editor
- 登录你的 Supabase 项目
- 点击左侧菜单的 "SQL Editor"
- 点击 "New query" 创建新查询

### 2. 执行快速设置脚本
复制 `docs/QUICK_SETUP.sql` 中的内容到 SQL Editor，然后点击 "Run" 按钮。

```sql
-- 这个脚本会创建：
-- ✅ note_comments 表
-- ✅ RLS 安全策略
-- ✅ 必要的索引
```

### 3. 验证设置
复制 `docs/TEST_SETUP.sql` 中的内容到 SQL Editor 运行，检查：
- ✅ 表结构是否正确
- ✅ RLS 策略是否生效
- ✅ 索引是否创建成功

### 4. 测试功能
在你的应用中测试：
```javascript
// 在浏览器控制台运行
import { testNotesCommentsSystem } from './utils/testNotesComments';
testNotesCommentsSystem().then(console.log);
```

## 📋 数据库表结构

### notes 表（应该已存在）
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY,
  text TEXT NOT NULL,
  author TEXT DEFAULT 'Aura',
  slug TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### note_comments 表（新创建）
```sql
CREATE TABLE note_comments (
  id UUID PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES note_comments(id) ON DELETE CASCADE,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔒 安全策略 (RLS)

### 读取策略
- ✅ 任何人都可以读取**已批准**的评论
- ✅ 只显示 `approved = true` 的评论

### 写入策略
- ✅ 任何人都可以提交评论
- ✅ 新评论默认 `approved = false`（需要审核）
- ✅ 只有认证用户可以批准/删除评论

## 🛠️ 管理评论

### 查看待审核评论
```sql
SELECT * FROM note_comments WHERE approved = false;
```

### 批准评论
```sql
UPDATE note_comments SET approved = true WHERE id = 'comment-id';
```

### 批量批准
```sql
UPDATE note_comments SET approved = true WHERE approved = false;
```

## 🧪 测试数据

如果需要测试数据，可以运行：

```sql
-- 插入测试笔记
INSERT INTO notes (text, author) VALUES 
('这是一条测试笔记，用于验证评论系统。', 'Aura');

-- 插入测试评论
INSERT INTO note_comments (note_id, author, email, content, approved) 
SELECT 
  id,
  '测试用户',
  'test@example.com',
  '这是一条测试评论！',
  true
FROM notes
LIMIT 1;
```

## 🔍 故障排除

### 问题 1: 评论不显示
**原因**: 评论可能未被批准
**解决**: 检查 `approved` 字段，手动批准评论

### 问题 2: 无法提交评论
**原因**: RLS 策略或表结构问题
**解决**: 重新运行设置脚本

### 问题 3: 嵌套回复不工作
**原因**: `parent_id` 外键约束问题
**解决**: 检查 `parent_id` 是否指向有效的评论 ID

## 📊 监控和维护

### 定期检查
- 查看待审核评论数量
- 清理垃圾评论
- 监控评论活跃度

### 性能优化
- 定期 VACUUM 表
- 监控索引使用情况
- 考虑评论分页

## ✅ 完成检查清单

- [ ] `note_comments` 表已创建
- [ ] RLS 策略已启用
- [ ] 索引已创建
- [ ] 测试脚本运行成功
- [ ] 前端应用可以读取评论
- [ ] 前端应用可以提交评论
- [ ] 评论审核流程正常
- [ ] 嵌套回复功能正常

完成以上步骤后，你的 Notes 评论系统就可以正常工作了！