import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://suitmedia-backend.suitdev.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/proxy-image': {
        target: 'https://assets.suitdev.com',
        changeOrigin: true,
        rewrite: (path) => {
          // Extract the URL parameter from the proxy request
          const url = new URL(path, 'http://localhost').searchParams.get('url');
          if (url) {
            return url.replace('https://assets.suitdev.com', '');
          }
          return path;
        },
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add headers to handle CORS
            proxyReq.setHeader('Access-Control-Allow-Origin', '*');
            proxyReq.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            proxyReq.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          });
        }
      }
    },
  },
});