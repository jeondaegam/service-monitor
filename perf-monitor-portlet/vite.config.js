import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 외부 접속 허용 (도커 필수)
    port: 5173,      // 포트 고정
    watch: {
      usePolling: true, // 윈도우-도커 간 파일 변경 감지 활성화 (실무 꿀팁)
    },
  },
})