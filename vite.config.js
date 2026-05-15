import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // Minify JavaScript & CSS aggressively
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 3, // Extra passes untuk aggressive minification
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
      },
      format: {
        comments: false,
      },
      mangle: {
        toplevel: true, // Mangle top-level variables
      },
    },
    // Code splitting untuk reduce main bundle
    rollupOptions: {
      output: {
        manualChunks: {
          'vue': ['vue', 'vue-router', 'pinia'],
          'vendor': ['@supabase/supabase-js'],
        },
        // Optimize chunk file names for better caching
        entryFileNames: 'js/[name]-[hash:8].js',
        chunkFileNames: 'js/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8][extname]',
      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Report compressed size
    reportCompressedSize: true,
    // Source maps only for production debugging
    sourcemap: false,
    // Increase chunk size warning to highlight unused code
    chunkSizeWarningLimit: 500,
  },
})
