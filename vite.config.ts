import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // 원하는 포트 번호 지정
    strictPort: true, // 설정한 포트가 이미 사용 중이면 서버를 실행하지 않고 오류를 발생시킴
  },
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
})