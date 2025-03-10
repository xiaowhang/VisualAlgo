import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/ALG/', // 仓库名称，请修改为您的GitHub仓库名称
})
