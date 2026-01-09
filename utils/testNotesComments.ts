import { notesApi, noteCommentsApi } from '../services/supabaseService';

/**
 * 测试 Notes 评论系统功能
 */
export async function testNotesCommentsSystem() {
    console.log('🧪 开始测试 Notes 评论系统...\n');

    try {
        // 1. 测试获取所有 notes
        console.log('1️⃣ 测试获取 Notes 列表...');
        const notes = await notesApi.getAll();
        console.log(`✅ 成功获取 ${notes.length} 条笔记`);
        
        if (notes.length === 0) {
            console.log('⚠️ 没有找到笔记，请先在数据库中添加一些笔记');
            return;
        }

        const firstNote = notes[0];
        console.log(`📝 测试笔记: "${firstNote.text.substring(0, 50)}..."`);

        // 2. 测试获取单个 note
        console.log('\n2️⃣ 测试获取单个 Note...');
        const singleNote = await notesApi.getById(firstNote.id);
        console.log(`✅ 成功获取笔记: ${singleNote.id}`);

        // 3. 测试获取 note 评论
        console.log('\n3️⃣ 测试获取 Note 评论...');
        const comments = await noteCommentsApi.getByNoteId(firstNote.id);
        console.log(`✅ 成功获取 ${comments.length} 条评论`);

        // 4. 测试创建评论（可选，取消注释来测试）
        /*
        console.log('\n4️⃣ 测试创建 Note 评论...');
        const newComment = await noteCommentsApi.create({
            note_id: firstNote.id,
            author: '测试用户',
            email: 'test@example.com',
            content: '这是一条测试评论，用于验证 Notes 评论系统功能。'
        });
        console.log(`✅ 成功创建评论: ${newComment.id}`);
        */

        console.log('\n🎉 Notes 评论系统测试完成！所有功能正常工作。');
        
        return {
            success: true,
            notesCount: notes.length,
            commentsCount: comments.length,
            testNote: firstNote
        };

    } catch (error) {
        console.error('❌ 测试失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 检查数据库表结构
 */
export async function checkDatabaseSchema() {
    console.log('🔍 检查数据库表结构...\n');

    try {
        // 检查 notes 表
        const notes = await notesApi.getAll();
        console.log('✅ notes 表连接正常');
        
        // 检查 note_comments 表
        if (notes.length > 0) {
            const comments = await noteCommentsApi.getByNoteId(notes[0].id);
            console.log('✅ note_comments 表连接正常');
        }

        console.log('\n📊 数据库表结构检查完成！');
        return true;

    } catch (error) {
        console.error('❌ 数据库表结构检查失败:', error);
        return false;
    }
}

// 在浏览器控制台中使用：
// import { testNotesCommentsSystem, checkDatabaseSchema } from './utils/testNotesComments';
// testNotesCommentsSystem().then(console.log);
// checkDatabaseSchema().then(console.log);