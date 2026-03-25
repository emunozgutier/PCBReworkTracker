import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { qrcode } from 'vite-plugin-qrcode'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    qrcode() // Display QR code in terminal
  ],
  define: {
    __LOCAL_IP__: JSON.stringify('192.168.1.152'),
    __PORT__: 5000
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5000,      // Port number
    strictPort: true // Fail if port is already in use
  }
})
