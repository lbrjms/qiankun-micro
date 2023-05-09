import qiankun from 'vite-plugin-qiankun';

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const useDevMode = true

// https://vitejs.dev/config/
export default defineConfig({

  // 生产环境需要指定运行域名作为base
  //  base: 'http://xxx.com/'
  // 这里的 'myMicroAppName' 是子应用名，主应用注册时AppName需保持一致
  plugins: [vue(),qiankun('sub-vue3', {
    useDevMode
  })],
  
server: {
  port:5130,
  origin: 'http://localhost:5130', //项目baseUrl，解决主应用中出现静态地址404问题
},
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
