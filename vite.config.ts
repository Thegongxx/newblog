import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // 修复：使用正确的环境变量名
        'process.env.API_KEY': JSON.stringify(env.VITE_NVIDIA_API_KEY || env.NVIDIA_API_KEY),
        'process.env.NVIDIA_API_KEY': JSON.stringify(env.VITE_NVIDIA_API_KEY || env.NVIDIA_API_KEY),
        'process.env.VITE_NVIDIA_API_KEY': JSON.stringify(env.VITE_NVIDIA_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // 确保 content 目录下的文件可以被访问
      publicDir: 'public',
      assetsInclude: ['**/*.md']
    };
});
