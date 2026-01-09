# GitHub API 配置指南

为了在Admin面板中删除文件系统笔记，需要配置GitHub API访问权限。

## 1. 创建GitHub Personal Access Token

1. 访问 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token (classic)"
3. 设置Token名称，如 "Blog Admin Delete Notes"
4. 选择权限：
   - `repo` - 完整的仓库访问权限（包括删除文件）
5. 点击 "Generate token"
6. 复制生成的token（只显示一次）

## 2. 配置环境变量

在 `.env` 文件中添加以下配置：

```bash
# GitHub API 配置
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repository-name
```

## 3. Vercel 部署配置

如果使用Vercel部署，需要在Vercel Dashboard中设置环境变量：

1. 进入项目设置 → Environment Variables
2. 添加以下变量：
   - `GITHUB_TOKEN`: 你的GitHub token
   - `GITHUB_OWNER`: 你的GitHub用户名
   - `GITHUB_REPO`: 仓库名称

## 4. 安全注意事项

- GitHub token具有仓库完整访问权限，请妥善保管
- 不要将token提交到代码仓库中
- 定期更新token以确保安全
- 如果token泄露，立即在GitHub中撤销并重新生成

## 5. 功能说明

配置完成后，Admin面板中的笔记删除功能将：

- **DATABASE笔记**: 从Supabase数据库删除记录
- **FILE笔记**: 通过GitHub API删除仓库中的.md文件
- 删除操作会自动创建一个commit记录
- 删除后需要重新部署以更新网站内容