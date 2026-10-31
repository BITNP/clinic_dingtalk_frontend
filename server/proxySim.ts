import crypto from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'

// Local stand-in for clinic_proxy_dingtalk. It speaks the same protocol as the
// real proxy (`/proxy` + `url` header, `/user` + `user-token` header) but skips
// DingTalk: the `user-token` header is treated as the student ID.
//
// Adapted from clinic_dingtalk_ng/server/proxySim.ts.

export interface ProxySimConfig {
  backend: string
  apiKey: string
}

type NextFunction = (err?: unknown) => void

function defaultConfig(): ProxySimConfig {
  return {
    backend: process.env.CLINIC_BACKEND || 'http://127.0.0.1:8080',
    apiKey: process.env.CLINIC_API_KEY || 'local-dev-key'
  }
}

function headerValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export function createProxySim(config: ProxySimConfig = defaultConfig()) {
  return async function proxySim(
    req: IncomingMessage,
    res: ServerResponse,
    next: NextFunction
  ): Promise<void> {
    // Strip the query string so `/user?...` still matches.
    const path = (req.url || '/').split('?')[0]

    // ---- /user endpoints (simulated DingTalk login) ----
    if (path === '/user' || path === '/user/') {
      const userToken = headerValue(req.headers['user-token'])
      res.setHeader('Content-Type', 'application/json')
      if (req.method === 'GET') {
        // The real proxy answers 200 with status 403 in the body.
        res.statusCode = 200
        res.end(userToken ? '{"status":200}' : '{"status":403}')
        return
      }
      if (req.method === 'POST') {
        if (!userToken) {
          res.statusCode = 400
          res.end('{"status":400}')
          return
        }
        res.end(JSON.stringify({ status: 200, student_id: userToken }))
        return
      }
      res.statusCode = 405
      res.end('{"status":405}')
      return
    }

    // Let Vite serve everything that isn't the proxy endpoint.
    if (path !== '/proxy' && path !== '/proxy/') {
      next()
      return
    }

    // ---- /proxy: forward to the local backend with a valid signature ----
    const target = headerValue(req.headers.url)
    const username = headerValue(req.headers['user-token'])
    res.setHeader('Content-Type', 'application/json')
    if (!target || !username) {
      res.statusCode = 400
      res.end('{"error":"missing url or user-token header"}')
      return
    }

    // Buffer the request body for POST/PUT/PATCH.
    const chunks: Buffer[] = []
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    const rawBody = Buffer.concat(chunks)

    // Inject "user" into the JSON body (mirrors Program.cs).
    let body: Buffer = rawBody
    const contentType = headerValue(req.headers['content-type'])
    const method = req.method || 'GET'
    if (
      (method === 'POST' || method === 'PUT' || method === 'PATCH') &&
      contentType.includes('application/json')
    ) {
      try {
        const json = JSON.parse(rawBody.toString('utf-8') || '{}')
        if (json && typeof json === 'object' && !json.user) {
          json.user = username
        }
        body = Buffer.from(JSON.stringify(json), 'utf-8')
      } catch {
        body = Buffer.from('{}', 'utf-8')
      }
    }

    // Build the backend URL with ?username=.
    const separator = target.includes('?') ? '&' : '?'
    const backendUrl = `${config.backend}${target}${separator}username=${encodeURIComponent(username)}`

    // Compute the signature (mirrors Program.cs).
    const dateStr = new Date().toUTCString()
    const apiKeySig = crypto
      .createHash('md5')
      .update(`${config.apiKey}${username}${dateStr}`)
      .digest('hex')

    const headers: Record<string, string> = {
      Date: dateStr,
      'X-API-KEY': apiKeySig,
      'X-Forwarded-For': req.socket.remoteAddress || '127.0.0.1',
      Accept: headerValue(req.headers.accept) || '*/*'
    }
    if (body.length > 0) {
      headers['Content-Type'] = contentType || 'application/json'
      headers['Content-Length'] = body.length.toString()
    }

    try {
      const response = await fetch(backendUrl, {
        method,
        headers,
        body: method === 'GET' || method === 'HEAD' ? undefined : body
      })

      res.statusCode = response.status
      response.headers.forEach((value, key) => {
        if (
          key.toLowerCase() !== 'content-encoding' &&
          key.toLowerCase() !== 'transfer-encoding' &&
          key.toLowerCase() !== 'content-length'
        ) {
          res.setHeader(key, value)
        }
      })
      res.end(Buffer.from(await response.arrayBuffer()))
    } catch (err) {
      res.statusCode = 502
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: `backend unreachable: ${err instanceof Error ? err.message : String(err)}`
        })
      )
    }
  }
}
