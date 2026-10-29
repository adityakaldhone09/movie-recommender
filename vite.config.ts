import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/home': 'http://127.0.0.1:8000',
      '/tmdb': 'http://127.0.0.1:8000',
      '/movie': 'http://127.0.0.1:8000',
      '/recommend': 'http://127.0.0.1:8000',
      '/genres': 'http://127.0.0.1:8000',
      '/discover': 'http://127.0.0.1:8000',
      '/health': 'http://127.0.0.1:8000',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});

