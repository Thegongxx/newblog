-- 快速设置脚本 - 在 Supabase SQL Editor 中执行
-- 复制粘贴到 SQL Editor 并点击 "Run" 按钮

-- 1. 创建 note_comments 表
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

-- 2. 启用 RLS
ALTER TABLE note_comments ENABLE ROW LEVEL SECURITY;

-- 3. 创建 RLS 策略
CREATE POLICY "Anyone can read approved note comments" ON note_comments
  FOR SELECT USING (approved = true);

CREATE POLICY "Anyone can insert note comments" ON note_comments
  FOR INSERT WITH CHECK (true);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_note_comments_note_id ON note_comments(note_id);
CREATE INDEX IF NOT EXISTS idx_note_comments_approved ON note_comments(approved);

-- 5. 验证设置
SELECT 'Setup completed successfully!' as status;