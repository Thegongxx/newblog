-- Notes 评论管理脚本
-- 用于管理和维护 note_comments 表

-- 1. 查看所有待审核的评论
SELECT 
  nc.id,
  n.text as note_text,
  nc.author,
  nc.content,
  nc.created_at,
  CASE 
    WHEN nc.parent_id IS NOT NULL THEN '↳ 回复'
    ELSE '💬 评论'
  END as comment_type
FROM note_comments nc
JOIN notes n ON nc.note_id = n.id
WHERE nc.approved = false
ORDER BY nc.created_at DESC;

-- 2. 批准所有评论（谨慎使用）
-- UPDATE note_comments SET approved = true WHERE approved = false;

-- 3. 批准特定评论（替换 'comment-id-here' 为实际的评论 ID）
-- UPDATE note_comments SET approved = true WHERE id = 'comment-id-here';

-- 4. 查看每个笔记的评论统计
SELECT 
  n.id,
  LEFT(n.text, 50) || '...' as note_preview,
  COUNT(nc.id) as total_comments,
  COUNT(CASE WHEN nc.approved = true THEN 1 END) as approved_comments,
  COUNT(CASE WHEN nc.approved = false THEN 1 END) as pending_comments
FROM notes n
LEFT JOIN note_comments nc ON n.id = nc.note_id
GROUP BY n.id, n.text
ORDER BY total_comments DESC;

-- 5. 查看最近的评论活动
SELECT 
  nc.id,
  LEFT(n.text, 30) || '...' as note_preview,
  nc.author,
  LEFT(nc.content, 50) || '...' as comment_preview,
  nc.approved,
  nc.created_at,
  CASE 
    WHEN nc.parent_id IS NOT NULL THEN 
      (SELECT author FROM note_comments WHERE id = nc.parent_id)
    ELSE NULL
  END as replying_to
FROM note_comments nc
JOIN notes n ON nc.note_id = n.id
ORDER BY nc.created_at DESC
LIMIT 20;

-- 6. 删除垃圾评论（谨慎使用）
-- DELETE FROM note_comments WHERE content ILIKE '%spam%' OR content ILIKE '%广告%';

-- 7. 查看评论树结构（特定笔记）
-- 替换 'note-id-here' 为实际的笔记 ID
/*
WITH RECURSIVE comment_tree AS (
  -- 顶级评论
  SELECT 
    id,
    note_id,
    author,
    content,
    parent_id,
    approved,
    created_at,
    0 as level,
    ARRAY[created_at] as path
  FROM note_comments
  WHERE note_id = 'note-id-here' AND parent_id IS NULL
  
  UNION ALL
  
  -- 子评论
  SELECT 
    nc.id,
    nc.note_id,
    nc.author,
    nc.content,
    nc.parent_id,
    nc.approved,
    nc.created_at,
    ct.level + 1,
    ct.path || nc.created_at
  FROM note_comments nc
  JOIN comment_tree ct ON nc.parent_id = ct.id
)
SELECT 
  REPEAT('  ', level) || '└─ ' || author as threaded_author,
  LEFT(content, 60) || '...' as content_preview,
  approved,
  created_at
FROM comment_tree
ORDER BY path;
*/

-- 8. 清理孤立的回复评论（父评论被删除的回复）
SELECT 
  nc.id,
  nc.author,
  nc.content,
  nc.parent_id as missing_parent_id
FROM note_comments nc
WHERE nc.parent_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM note_comments parent 
    WHERE parent.id = nc.parent_id
  );

-- 如果发现孤立评论，可以删除或将其转为顶级评论：
-- DELETE FROM note_comments WHERE parent_id NOT IN (SELECT id FROM note_comments);
-- 或者
-- UPDATE note_comments SET parent_id = NULL WHERE parent_id NOT IN (SELECT id FROM note_comments);