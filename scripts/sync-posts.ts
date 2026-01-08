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

async function syncPosts() {
    console.log('🚀 Starting Obsidian to Supabase Sync...');

    if (!fs.existsSync(POSTS_DIR)) {
        console.error(`❌ Dir not found: $\{POSTS_DIR\}`);
        return;
    }

    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
    console.log(`📂 Found $\{files.length\} markdown files.`);

    for (const file of files) {
        const filePath = path.join(POSTS_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        if (!data.title || !data.slug) {
            console.warn(`⚠️ Skipping $\{file\}: Missing title or slug in front matter.`);
            continue;
        }

        const html_content = await marked(content);
        const reading_time = Math.ceil(content.length / 500);

        const postObj = {
            title: data.title,
            slug: data.slug,
            content: content,
            html_content: html_content,
            excerpt: data.excerpt || '',
            category: data.category || 'Thought',
            cover_image: data.cover_image || '',
            published: data.published ?? true,
            reading_time: reading_time
        };

        console.log(`🔄 Syncing: $\{data.title\}...`);

        const { error } = await supabase
            .from('posts')
            .upsert(postObj, { onConflict: 'slug' });

        if (error) {
            console.error(`❌ Error syncing $\{data.title\}:`, error.message);
        } else {
            console.log(`✅ Success: $\{data.title\}`);
        }
    }

    console.log('✨ Sync Complete.');
}

syncPosts();
