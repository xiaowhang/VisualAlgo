import path from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      imports: ['vue', 'vue-router'],
      dts: true,
    }),
    Components({
      dts: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
