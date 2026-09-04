import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import os from 'os'

function getLocalIps() {
  const ips = ['localhost'];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

// IP allowlist middleware plugin — blocks requests not from localhost or private network (10.x, 172.x, 192.168.x)
function ipAllowlistPlugin() {
  return {
    name: 'ip-allowlist',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const forwarded = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
        const raw = forwarded || req.socket?.remoteAddress || '';
        // Normalise IPv6-mapped IPv4 (e.g. "::ffff:10.0.0.1" → "10.0.0.1")
        const ip = raw.replace(/^::ffff:/, '');
        const allowed =
          ip === '127.0.0.1' ||
          ip === '::1'       ||
          ip === 'localhost'  ||
          ip.startsWith('10.') ||
          ip.startsWith('172.') ||
          ip.startsWith('192.168.') ||
          req.socket?.remoteAddress === '127.0.0.1' ||
          req.socket?.remoteAddress === '::1';
        if (!allowed) {
          res.writeHead(403, { 'Content-Type': 'text/plain' });
          res.end(`403 Forbidden — access from ${ip} is not allowed.`);
          return;
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isCaddy = process.env.npm_lifecycle_event === 'dev:caddy' || process.env.BASE_PATH === '/RT/';
  const defaultDevBase = isCaddy ? '/RT/' : '/';
  const basePath = process.env.BASE_PATH ?? (command === 'build' ? '/Rework-Tracker/' : defaultDevBase);

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      ipAllowlistPlugin(),
    ],
    // Automatically use repository name only in production builds (GitHub Pages)
    // BASE_PATH env var lets Docker / Caddy override the base (default: /Rework-Tracker/ for GitHub Pages)
    base: basePath,
    define: {
      __LOCAL_IPS__: JSON.stringify(getLocalIps()),
      __PORT__: 5001,
      __BUILD_DATE__: JSON.stringify(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
    },
    server: {
      host: '0.0.0.0', // Listen on all network interfaces
      port: 5001,      // Port number
      strictPort: true, // Fail if port is already in use
      allowedHosts: ['asgv', 'asgv.infineon.com', 'localhost', '127.0.0.1'],
      proxy: {
        // Proxy any /api requests (e.g. /api/... or /RT/api/...) to the Express backend on 5002
        '^.*\\/api': {
          target: 'http://127.0.0.1:5002',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^.*\/api/, '/api'),
        },
      }
    }
  }
})
// force restart
