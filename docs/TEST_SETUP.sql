-- 测试脚本 - 验证 Notes 评论系统设置
-- 在 Supabase SQL Editor 中执行此脚本来验证设置

-- 1. 检查表是否存在
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    ) THEN '✅ 存在'
    ELSE '❌ 不存在'
  END as status
FROM (VALUES ('notes'), ('note_comments')) AS t(table_name);

-- 2. 检查 notes 表结构
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'notes'
ORDER BY ordinal_position;

-- 3. 检查 note_comments 表结构
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'note_comments'
ORDER BY ordinal_position;

-- 4. 检查 RLS 策略
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN '✅ 有条件'
    ELSE '⚠️ 无条件'
  END as has_condition
FROM pg_policies 
WHERE tablename IN ('notes', 'note_comments')
ORDER BY tablename, policyname;

-- 5. 检查索引
SELECT 
  indexname,
  tablename,
  CASE 
    WHEN indexname LIKE '%note_comments%' THEN '✅ Note评论索引'
    WHEN indexname LIKE '%notes%' THEN '✅ Notes索引'
    ELSE '📋 其他索引'
  END as index_type
FROM pg_indexes 
WHERE tablename IN ('notes', 'note_comments')
ORDER BY tablename, indexname;

-- 6. 统计数据
SELECT 
  'notes' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ 有数据'
    ELSE '⚠️ 无数据'
  END as data_status
FROM notes
UNION ALL
SELECT 
  'note_comments' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ 有数据'
    ELSE '⚠️ 无数据 (正常)'
  END as data_status
FROM note_comments;

-- 7. 测试插入评论（如果有 notes 数据）
-- 注意：这会实际插入数据，请谨慎使用
/*
INSERT INTO note_comments (note_id, author, email, content, approved)
SELECT 
  id,
  'Test User',
  'test@example.com',
  'This is a test comment to verify the system works.',
  true
FROM notes
LIMIT 1
RETURNING id, note_id, author, content, approved, created_at;
*/