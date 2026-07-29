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
    base: command === 'build' ? '/Rework-Tracker/' : '/',
    define: {
      __LOCAL_IPS__: JSON.stringify(getLocalIps()),
      __PORT__: 5001
    },
    server: {
      host: '0.0.0.0', // Listen on all network interfaces
      port: 5001,      // Port number
      strictPort: true // Fail if port is already in use
    }
  }
})
