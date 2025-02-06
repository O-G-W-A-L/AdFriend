import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { chromeExtension } from 'vite-plugin-chrome-extension'

export default defineConfig({
  plugins: [react(), chromeExtension()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        manifest: resolve(__dirname, 'manifest.json')

      },
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  publicDir: 'public'
})
