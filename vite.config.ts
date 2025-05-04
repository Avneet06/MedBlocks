import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react', '@electric-sql/pglite'] // Make sure @electric-sql/pglite is here
  },
  build: {
    commonjsOptions: {
      include: [ /node_modules/]
    }
  }
});