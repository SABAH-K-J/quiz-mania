import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const DEFAULT_SITE_URL = 'https://quiz-mania.vercel.app'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://127.0.0.1:8000'
  const siteUrl = (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '')

  const siteUrlPlugin = {
    name: 'quizmania-site-url',
    transformIndexHtml(html) {
      return html.replaceAll('%SITE_URL%', siteUrl)
    },
    closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist')
      for (const file of ['robots.txt', 'sitemap.xml']) {
        const filePath = path.join(distDir, file)
        if (!fs.existsSync(filePath)) continue
        const contents = fs.readFileSync(filePath, 'utf8').replaceAll('__SITE_URL__', siteUrl)
        fs.writeFileSync(filePath, contents)
      }
    },
  }

  return {
    plugins: [react(), siteUrlPlugin],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': { target: proxyTarget, changeOrigin: true },
        '/media': { target: proxyTarget, changeOrigin: true },
        '/admin': { target: proxyTarget, changeOrigin: true },
      },
    },
    preview: {
      port: 4173,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  }
})
