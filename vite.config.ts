import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import { defineConfig, loadEnv, type Plugin } from 'vite'

import { createProxySim } from './server/proxySim'

function proxySimPlugin(env: Record<string, string>): Plugin {
  const proxy = createProxySim({
    backend: env.CLINIC_BACKEND || 'http://127.0.0.1:8080',
    apiKey: env.CLINIC_API_KEY || 'local-dev-key'
  })

  return {
    name: 'clinic-proxy-sim',
    configureServer(server) {
      server.middlewares.use(proxy)
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: mode === 'production' ? '/lightapp/' : '/',
    plugins: [
      proxySimPlugin(env),
      vue(),
      legacy({
        targets: ['iOS >= 12', 'Android >= 6'],
        modernPolyfills: true
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      host: '0.0.0.0',
      port: 8888
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 800
    }
  }
})
