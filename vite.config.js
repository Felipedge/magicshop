import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// La app llama a /api/... y Vite reenvía esas peticiones a json-server (puerto 3001).
const proxy = {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
    rewrite: (ruta) => ruta.replace(/^\/api/, ''),
  },
};

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
});
