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

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    // Automatically use repository name only in production builds (GitHub Pages)
    // BASE_PATH env var lets Docker override the base (default: /Rework-Tracker/ for GitHub Pages)
    base: process.env.BASE_PATH ?? (command === 'build' ? '/Rework-Tracker/' : '/'),
    define: {
      __LOCAL_IPS__: JSON.stringify(getLocalIps()),
      __PORT__: 5001,
      __BUILD_DATE__: JSON.stringify(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
    },
    server: {
      host: '0.0.0.0', // Listen on all network interfaces
      port: 5001,      // Port number
      strictPort: true, // Fail if port is already in use
      // Block every connection that isn't from localhost or the 10.x.x.x subnet
      middlewares: [
        (req: any, res: any, next: any) => {
          const raw = req.socket?.remoteAddress ?? '';
          // Normalise IPv6-mapped IPv4 (e.g. "::ffff:10.0.0.1" → "10.0.0.1")
          const ip = raw.replace(/^::ffff:/, '');
          const allowed =
            ip === '127.0.0.1' ||
            ip === '::1'       ||
            ip === 'localhost'  ||
            ip.startsWith('10.');
          if (!allowed) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end(`403 Forbidden — access from ${ip} is not allowed.`);
            return;
          }
          next();
        },
      ],
    }
  }
})
// force restart
