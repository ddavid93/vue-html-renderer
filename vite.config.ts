import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      // Generate declaration files from .ts and .vue files in src
      include: ['src/**/*.ts', 'src/**/*.vue'],
      // Exclude test files and env.d.ts
      exclude: ['src/**/__tests__/**', 'env.d.ts'],
      // Output directory for declaration files
      outDir: 'dist',
      // Don't rollup types to avoid api-extractor issues
      rollupTypes: false,
      // Entry point for types
      entryRoot: 'src',
      // Insert at end to ensure types are generated after build
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      // Entry point for the library
      entry: resolve(__dirname, 'src/main.ts'),
      // Library name (global variable name in UMD build)
      name: 'VueHTMLRenderer',
      // Output file names for different formats
      fileName: (format) => `vue-html-renderer.${format === 'es' ? 'js' : 'umd.cjs'}`,
    },
    rollupOptions: {
      // Externalize Vue - don't bundle it with the library
      // Users will provide Vue as a peer dependency
      external: ['vue'],
      output: {
        // Global variables to use in UMD build for externalized deps
        globals: {
          vue: 'Vue',
        },
        // Preserve exports from the entry point
        exports: 'named',
      },
    },
    // Generate source maps for debugging
    sourcemap: true,
    // Clear the output directory before building
    emptyOutDir: true,
  },
})
