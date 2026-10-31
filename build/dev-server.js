'use strict'

const path = require('path')
const webpack = require('webpack')
const express = require('express')
const historyApiFallback = require('connect-history-api-fallback')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const config = require('../config')
const { createProxySim } = require('./proxySim')

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

// `local` uses build/webpack.dev-local.conf.js (local backend + DingTalk
// bypass); `proxy` uses build/webpack.dev.conf.js (real remote proxy).
const mode = process.argv[2] === 'proxy' ? 'proxy' : 'local'
const webpackConfigPath = mode === 'proxy'
  ? './webpack.dev.conf'
  : './webpack.dev-local.conf'

async function start () {
  const webpackConfig = await require(webpackConfigPath)
  const compiler = webpack(webpackConfig)

  // webpack-dev-server used to inject the HMR client automatically.
  const entry = webpackConfig.entry || {}
  Object.keys(entry).forEach(name => {
    entry[name] = ['webpack-hot-middleware/client?reload=true'].concat(entry[name])
  })

  const app = express()
  const hotMiddleware = webpackHotMiddleware(compiler, { log: () => {} })

  // Force a page reload when html-webpack-plugin re-emits index.html.
  compiler.plugin('compilation', compilation => {
    compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
      hotMiddleware.publish({ action: 'reload' })
      cb()
    })
  })

  // Local stand-in for clinic_proxy_dingtalk (`/user` and `/proxy`).
  app.use(createProxySim())

  // SPA fallback, then the webpack bundle and HMR event stream.
  app.use(historyApiFallback())
  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
  }))
  app.use(hotMiddleware)

  // Serve files copied from static/ (mirrors webpack-dev-server's setup).
  const staticPath = path.posix.join(webpackConfig.devServer.publicPath, 'static')
  app.use(staticPath, express.static(path.resolve(__dirname, '../static')))

  const host = webpackConfig.devServer.host || config.dev.host
  const port = webpackConfig.devServer.port || config.dev.port

  const server = app.listen(port, host, () => {
    console.log(`> Starting ${mode} dev server...`)
    console.log(`> Listening at http://localhost:${port}\n`)
  })

  process.on('SIGINT', () => {
    server.close(() => process.exit(0))
  })
}

start().catch(err => {
  console.error(err)
  process.exit(1)
})
