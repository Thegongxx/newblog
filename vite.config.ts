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
      'process.env.API_KEY': JSON.stringify(env.VITE_NVIDIA_API_KEY || env.NVIDIA_API_KEY),
      'process.env.NVIDIA_API_KEY': JSON.stringify(env.VITE_NVIDIA_API_KEY || env.NVIDIA_API_KEY),
      'process.env.VITE_NVIDIA_API_KEY': JSON.stringify(env.VITE_NVIDIA_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    publicDir: 'public',
    assetsInclude: ['**/*.md'],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-motion': ['framer-motion'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-helmet': ['react-helmet-async'],
            'vendor-swr': ['swr'],
          },
        },
      },
      cssCodeSplit: true,
      chunkSizeWarningLimit: 500,
      // 优化构建性能
      minify: 'esbuild',
      target: 'es2020',
      sourcemap: false, // 生产环境不生成 sourcemap
      // 启用 gzip 压缩提示
      reportCompressedSize: true,
    },
  };
});
