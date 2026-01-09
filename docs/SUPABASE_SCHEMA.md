# Supabase 数据库结构

## 📊 数据表结构

### 1. posts 表（文章）
```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  html_content TEXT,
  excerpt TEXT,
  category TEXT DEFAULT 'Thought',
  cover_image TEXT,
  published BOOLEAN DEFAULT true,
  reading_time INTEGER DEFAULT 5,
  views INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. notes 表（随想笔记）
```sql
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  author TEXT DEFAULT 'Aura',
  slug TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. comments 表（文章评论）
```sql
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. note_comments 表（笔记评论）
```sql
CREATE TABLE note_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES note_comments(id) ON DELETE CASCADE,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. homepage_comments 表（主页留言）
```sql
CREATE TABLE homepage_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES homepage_comments(id) ON DELETE CASCADE,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. likes 表（点赞记录）
```sql
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_type TEXT NOT NULL, -- 'post', 'note', 'comment', etc.
  target_id TEXT NOT NULL,
  user_fingerprint TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 RLS (Row Level Security) 策略

### 启用 RLS
```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
```

### 基本读取策略（所有人可读已发布内容）
```sql
-- 文章读取策略
CREATE POLICY "Anyone can read published posts" ON posts
  FOR SELECT USING (published = true);

-- 笔记读取策略
CREATE POLICY "Anyone can read notes" ON notes
  FOR SELECT USING (true);

-- 评论读取策略
CREATE POLICY "Anyone can read approved comments" ON comments
  FOR SELECT USING (approved = true);

CREATE POLICY "Anyone can read approved note comments" ON note_comments
  FOR SELECT USING (approved = true);

CREATE POLICY "Anyone can read approved homepage comments" ON homepage_comments
  FOR SELECT USING (approved = true);

-- 点赞读取策略
CREATE POLICY "Anyone can read likes" ON likes
  FOR SELECT USING (true);
```

## 🚀 必需的 Supabase 函数

### 1. 增加浏览量函数
```sql
CREATE OR REPLACE FUNCTION increment_views(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET views = COALESCE(views, 0) + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;
```

### 2. 更新时间戳函数
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 posts 表添加触发器
CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

## 🔑 环境变量配置

在 `.env` 文件中配置：
```env
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📝 使用说明

### 1. 测试连接
```typescript
import { testSupabaseConnection } from './utils/supabaseTest';

// 测试连接
const result = await testSupabaseConnection();
console.log(result);
```

### 2. 同步 Markdown 到数据库
```bash
npm run sync
```

### 3. 检查数据库状态
在浏览器控制台中运行：
```javascript
import { getDatabaseInfo } from './utils/supabaseTest';
getDatabaseInfo().then(console.log);
```

## 🛠️ 故障排除

### 常见问题
1. **连接失败** - 检查 URL 和密钥是否正确
2. **权限错误** - 检查 RLS 策略是否正确配置
3. **数据不显示** - 检查 `published` 字段是否为 `true`
4. **同步失败** - 检查 Markdown 文件格式和 frontmatter

### 调试步骤
1. 检查环境变量
2. 测试数据库连接
3. 检查表结构
4. 验证 RLS 策略
5. 查看 Supabase 日志