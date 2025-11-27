import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy user service
      '/api/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // Proxy booking service
      '/api/bookings': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      // Proxy payment service
      '/api/payments': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
