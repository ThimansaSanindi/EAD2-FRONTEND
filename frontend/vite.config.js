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
      },
      // Proxy movie service
      '/api/movies': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        secure: false,
      },
      // Proxy showtime service
      '/api/showtimes': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
