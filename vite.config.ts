// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // FirebaseのモジュールをViteが正しく見つけられるように、
  // この optimizeDeps の設定を追加しました。
  optimizeDeps: {
    include: ['firebase/app', 'firebase/firestore'],
  },
})
