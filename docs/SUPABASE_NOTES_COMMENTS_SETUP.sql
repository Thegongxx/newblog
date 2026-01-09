-- =====================================================
-- Supabase Notes 评论系统完整设置脚本
-- 请在 Supabase SQL Editor 中按顺序执行
-- =====================================================

-- 1. 创建 notes 表（如果不存在）
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  author TEXT DEFAULT 'Aura',
  slug TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建 note_comments 表
CREATE TABLE IF NOT EXISTS note_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES note_comments(id) ON DELETE CASCADE,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_note_comments_note_id ON note_comments(note_id);
CREATE INDEX IF NOT EXISTS idx_note_comments_parent_id ON note_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_note_comments_approved ON note_comments(approved);
CREATE INDEX IF NOT EXISTS idx_note_comments_created_at ON note_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);

-- 4. 启用 Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_comments ENABLE ROW LEVEL SECURITY;

-- 5. 创建 RLS 策略 - Notes 表
-- 所有人可以读取笔记
DROP POLICY IF EXISTS "Anyone can read notes" ON notes;
CREATE POLICY "Anyone can read notes" ON notes
  FOR SELECT USING (true);

-- 只有认证用户可以插入笔记（可选，根据需要调整）
DROP POLICY IF EXISTS "Authenticated users can insert notes" ON notes;
CREATE POLICY "Authenticated users can insert notes" ON notes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 只有认证用户可以更新自己的笔记（可选）
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. 创建 RLS 策略 - Note Comments 表
-- 所有人可以读取已批准的评论
DROP POLICY IF EXISTS "Anyone can read approved note comments" ON note_comments;
CREATE POLICY "Anyone can read approved note comments" ON note_comments
  FOR SELECT USING (approved = true);

-- 所有人可以插入评论（但默认未批准）
DROP POLICY IF EXISTS "Anyone can insert note comments" ON note_comments;
CREATE POLICY "Anyone can insert note comments" ON note_comments
  FOR INSERT WITH CHECK (true);

-- 只有认证用户可以更新评论状态（用于审核）
DROP POLICY IF EXISTS "Authenticated users can update note comments" ON note_comments;
CREATE POLICY "Authenticated users can update note comments" ON note_comments
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 只有认证用户可以删除评论
DROP POLICY IF EXISTS "Authenticated users can delete note comments" ON note_comments;
CREATE POLICY "Authenticated users can delete note comments" ON note_comments
  FOR DELETE USING (auth.role() = 'authenticated');

-- 7. 创建触发器函数 - 更新 notes 的 updated_at 字段（如果需要）
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 添加 updated_at 字段到 notes 表（如果需要）
ALTER TABLE notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 9. 创建触发器
DROP TRIGGER IF EXISTS update_notes_updated_at_trigger ON notes;
CREATE TRIGGER update_notes_updated_at_trigger
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_notes_updated_at();

-- 10. 创建函数 - 获取评论数量
CREATE OR REPLACE FUNCTION get_note_comments_count(note_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM note_comments
    WHERE note_id = note_uuid AND approved = true
  );
END;
$$ LANGUAGE plpgsql;

-- 11. 创建函数 - 批量批准评论
CREATE OR REPLACE FUNCTION approve_note_comments(comment_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE note_comments
  SET approved = true
  WHERE id = ANY(comment_ids);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- 12. 创建视图 - 带评论数量的笔记
CREATE OR REPLACE VIEW notes_with_stats AS
SELECT 
  n.*,
  COALESCE(c.comments_count, 0) as comments_count
FROM notes n
LEFT JOIN (
  SELECT 
    note_id,
    COUNT(*) as comments_count
  FROM note_comments
  WHERE approved = true
  GROUP BY note_id
) c ON n.id = c.note_id
ORDER BY n.created_at DESC;

-- 13. 插入测试数据（可选 - 取消注释来添加测试数据）
/*
-- 插入测试笔记
INSERT INTO notes (text, author) VALUES 
('生活就像一杯茶，不会苦一辈子，但总会苦一阵子。', 'Aura'),
('在最深的绝望里，遇见最美丽的惊喜。', 'Aura'),
('时间会证明一切，也会带走一切。', 'Aura');

-- 插入测试评论（需要先有笔记）
INSERT INTO note_comments (note_id, author, email, content, approved) 
SELECT 
  n.id,
  '测试用户',
  'test@example.com',
  '这是一条测试评论，用来验证评论系统是否正常工作。',
  true
FROM notes n
LIMIT 1;
*/

-- 14. 验证设置
-- 检查表是否创建成功
SELECT 
  'notes' as table_name,
  COUNT(*) as record_count
FROM notes
UNION ALL
SELECT 
  'note_comments' as table_name,
  COUNT(*) as record_count
FROM note_comments;

-- 检查 RLS 策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('notes', 'note_comments')
ORDER BY tablename, policyname;

-- =====================================================
-- 设置完成！
-- 
-- 接下来你可以：
-- 1. 在应用中测试 notes 和评论功能
-- 2. 使用 notes_with_stats 视图获取带评论数的笔记
-- 3. 调用 get_note_comments_count() 函数获取特定笔记的评论数
-- 4. 使用 approve_note_comments() 函数批量审核评论
-- =====================================================