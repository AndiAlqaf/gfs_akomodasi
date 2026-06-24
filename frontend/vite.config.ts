import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 4321,
    strictPort: true,
    allowedHosts: ['siakmo.devraffi.my.id'],
  },
  preview: {
    host: '0.0.0.0',
    port: 4321,
    strictPort: true,
    allowedHosts: ['siakmo.devraffi.my.id'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
