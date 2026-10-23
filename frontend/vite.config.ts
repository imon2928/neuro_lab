import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Build output goes straight into the Django app's static folder.
// Django serves it at /static/lab/ (see lab/templates/lab/index.html).
export default defineConfig({
  base: '/static/lab/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {'@': path.resolve(import.meta.dirname, '.')},
  },
  build: {
    outDir: path.resolve(import.meta.dirname, '../lab/static/lab'),
    emptyOutDir: false, // keep lab/static/lab/docs/
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Fixed file names; Django's ManifestStaticFilesStorage adds the cache-busting hash.
        entryFileNames: 'app.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
    },
  },
});
