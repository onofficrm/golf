import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 환경 변수 로드 (로컬에서는 .env 파일, GitHub Actions에서는 시스템 환경 변수)
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      // 1. 배포 경로 추가: 주소 뒤에 /golf/가 붙으므로 반드시 필요합니다.
      base: "/golf/", 
      
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
