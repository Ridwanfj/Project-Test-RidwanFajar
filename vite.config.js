import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://suitmedia-backend.suitdev.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('API proxy error:', err);
          });
        }
      },
      '/api/proxy-image': {
        target: 'https://cors-anywhere.herokuapp.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          const params = new URLSearchParams(path.split('?')[1]);
          const imageUrl = params.get('url');
          return imageUrl ? `/${imageUrl}` : path;
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Image proxy error:', err);
            
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Image proxy unavailable');
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
         
            proxyReq.setHeader('X-Requested-With', 'XMLHttpRequest');
            proxyReq.setHeader('Origin', 'http://localhost:3000');
          });
        }
      }
    },
    cors: true,
    host: '0.0.0.0',
    port: 3000
  }
});