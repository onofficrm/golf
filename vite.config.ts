import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 환경 변수 로드
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      // 1. 배포 경로 수정: Vercel은 루트(/)를 기본으로 사용합니다.
      base: "/", 
      
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      
      // 2. 환경 변수 정의
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
