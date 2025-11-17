import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',  // Build output goes to ./dist
    rollupOptions: {
      input: 'src/index.html',  // Ensure the entry point is your index.html
    },
  },
});
