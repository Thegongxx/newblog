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
          },
        },
      },
      cssCodeSplit: true,
      chunkSizeWarningLimit: 500,
    },
  };
});
