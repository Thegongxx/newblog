// API端点：删除GitHub仓库中的笔记文件
// DELETE /api/notes/delete

export default async function handler(req: any, res: any) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { noteId } = req.body;
        
        if (!noteId) {
            return res.status(400).json({ error: 'Note ID is required' });
        }

        // GitHub API配置
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const GITHUB_OWNER = process.env.GITHUB_OWNER || 'your-username';
        const GITHUB_REPO = process.env.GITHUB_REPO || 'your-repo';
        
        if (!GITHUB_TOKEN) {
            return res.status(500).json({ 
                error: 'GitHub token not configured. Please set GITHUB_TOKEN environment variable.' 
            });
        }

        const filePath = `content/notes/${noteId}.md`;
        
        // 首先获取文件信息以获取SHA
        const getFileResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                }
            }
        );

        if (!getFileResponse.ok) {
            if (getFileResponse.status === 404) {
                return res.status(404).json({ error: 'Note file not found' });
            }
            throw new Error(`Failed to get file info: ${getFileResponse.statusText}`);
        }

        const fileInfo = await getFileResponse.json();
        
        // 删除文件
        const deleteResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Delete note: ${noteId}.md`,
                    sha: fileInfo.sha
                })
            }
        );

        if (!deleteResponse.ok) {
            throw new Error(`Failed to delete file: ${deleteResponse.statusText}`);
        }

        return res.status(200).json({ 
            success: true, 
            message: `Note ${noteId}.md deleted successfully`,
            commit: await deleteResponse.json()
        });
        
    } catch (error) {
        console.error('Delete note error:', error);
        return res.status(500).json({ 
            error: 'Failed to delete note file',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}