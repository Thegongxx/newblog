import fs from 'fs';

const content = fs.readFileSync('content/notes/测试.md', 'utf-8');
console.log('=== 原始内容 ===');
console.log(content.substring(0, 300));

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n+/);
  if (!match) return { metadata: {}, content };
  
  const metadata = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let currentArray = null;
  
  console.log('\n=== 解析行 ===');
  for (const line of lines) {
    console.log(`行: "${line}"`);
    
    // 检查是否是数组项 (以 "  - " 开头)
    if (line.match(/^\s+-\s+/)) {
      console.log('  -> 数组项');
      if (currentKey && currentArray !== null) {
        currentArray.push(line.replace(/^\s+-\s+/, '').trim());
      }
      continue;
    }
    
    // 保存之前的数组
    if (currentKey && currentArray !== null) {
      metadata[currentKey] = currentArray;
      console.log(`  -> 保存数组 ${currentKey}:`, currentArray);
      currentArray = null;
      currentKey = null;
    }
    
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      
      // 检查是否是数组开始 (值为空，下一行是 - 开头)
      if (val === '') {
        currentKey = key;
        currentArray = [];
        console.log(`  -> 开始数组: ${key}`);
        continue;
      }
      
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (!isNaN(Number(val)) && val !== '') val = Number(val);
      metadata[key] = val;
      console.log(`  -> 键值: ${key} = ${val}`);
    }
  }
  
  // 保存最后一个数组
  if (currentKey && currentArray !== null) {
    metadata[currentKey] = currentArray;
    console.log(`  -> 保存最后数组 ${currentKey}:`, currentArray);
  }
  
  return { metadata, content: content.slice(match[0].length) };
}

const result = parseFrontmatter(content);
console.log('\n=== 最终结果 ===');
console.log('metadata:', result.metadata);
console.log('tags:', result.metadata.tags);
