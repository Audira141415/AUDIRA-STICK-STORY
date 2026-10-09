import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const shared = { '@shared': resolve(__dirname, 'src/shared') }

export default defineConfig({
  root: resolve(__dirname, 'src/renderer'),
  resolve: {
    alias: {
      ...shared,
      '@renderer': resolve(__dirname, 'src/renderer/src')
    }
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'resolve-studio-protocol',
      transform(code, id) {
        if (id.endsWith('.css') || id.includes('.css?')) {
          return code.replace(/studio:\/\/fonts\//g, '/studio/fonts/')
        }
        return code
      }
    }
  ],
  server: {
    port: 5200,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5201',
        changeOrigin: true
      },
      '/studio': {
        target: 'http://127.0.0.1:5201',
        changeOrigin: true
      }
    }
  }

})
