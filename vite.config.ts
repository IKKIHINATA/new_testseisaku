// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ↓↓↓ この optimizeDeps の設定を追記してください ↓↓↓
  optimizeDeps: {
    include: ['firebase/app', 'firebase/firestore'],
  },
})