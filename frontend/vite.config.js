import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // lets the httpOnly cookie work in dev without cross-site issues
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
