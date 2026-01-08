import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { marked } from 'marked';

// 加载环境变量 (需要 .env 文件)
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log('🔍 Environment check:');
    console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
    console.log('SUPABASE_KEY:', supabaseKey ? '✅ Found' : '❌ Missing');
    console.error('❌ Error: Necessary environment variables must be set.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const POSTS_DIR = path.resolve(__dirname, '../content/posts');
const NOTES_DIR = path.resolve(__dirname, '../content/notes');

async function syncPosts() {
    console.log('🚀 Starting Content Sync (Posts & Notes)...');

    // 1. 同步文章 (Posts)
    await syncCollection(POSTS_DIR, 'posts', (data, content) => ({
        title: data.title,
        slug: data.slug,
        content: content,
        html_content: marked.parse(content) as string,
        excerpt: data.excerpt || '',
        category: data.category || 'Thought',
        cover_image: data.cover_image || '',
        published: data.published ?? true,
        reading_time: Math.ceil(content.length / 500)
    }));

    // 2. 同步随感 (Notes)
    await syncCollection(NOTES_DIR, 'notes', (data, content) => ({
        text: content.trim(),
        author: data.author || 'Aura',
        slug: data.slug || path.parse(data.file).name, // 自动生成 slug 用于冲突检测
        created_at: data.date ? new Date(data.date).toISOString() : new Date().toISOString()
    }));

    console.log('✨ All Sync Complete.');
}

async function syncCollection(dir: string, table: string, mapper: (data: any, content: string) => any) {
    if (!fs.existsSync(dir)) {
        console.warn(`⚠️ Warning: Dir not found: ${dir}. Skipping.`);
        return;
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    console.log(`📂 Found ${files.length} markdown files in ${path.basename(dir)}/`);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        // 传递文件名给 mapper 以便生成 slug
        const postObj = mapper({ ...data, file: file }, content);

        if (!postObj.slug && table === 'posts') {
            console.warn(`⚠️ Skipping ${file}: Missing slug.`);
            continue;
        }

        console.log(`🔄 Syncing: ${postObj.title || file} -> ${table}`);

        const { error } = await supabase
            .from(table)
            .upsert(postObj, { onConflict: 'slug' });

        if (error) {
            console.error(`❌ Error syncing to ${table}:`, error.message);
        } else {
            console.log(`✅ Success: ${file}`);
        }
    }
}

syncPosts();
