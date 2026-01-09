// API端点：删除文件系统中的笔记文件
// DELETE /api/delete-note

import fs from 'fs';
import path from 'path';

export default function handler(req: any, res: any) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { noteId } = req.body;
        
        if (!noteId) {
            return res.status(400).json({ error: 'Note ID is required' });
        }

        // 构建文件路径
        const filePath = path.join(process.cwd(), 'content', 'notes', `${noteId}.md`);
        
        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Note file not found' });
        }

        // 删除文件
        fs.unlinkSync(filePath);
        
        return res.status(200).json({ 
            success: true, 
            message: `Note ${noteId}.md deleted successfully` 
        });
        
    } catch (error) {
        console.error('Delete note error:', error);
        return res.status(500).json({ 
            error: 'Failed to delete note file',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}