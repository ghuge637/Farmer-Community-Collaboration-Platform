import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use a project-local cache dir to avoid Windows file locks in node_modules
  
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // rewrite cookie domain so browser accepts Set-Cookie from proxy
        cookieDomainRewrite: {
          '*': ''
        }
      }
    }
  }
})
