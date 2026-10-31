import axios, { AxiosHeaders } from 'axios'

import { getToken } from '@/auth/token'

import { toApiError } from './errors'
import type { UserStatusResponse } from './types'

export const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/+$/, '')
export const PROXY_URL = import.meta.env.VITE_PROXY_URL || '/proxy'
export const USER_URL = import.meta.env.VITE_USER_URL || '/user'

export function buildApiPath(url?: string, baseURL = API_BASE): string {
  const base = (baseURL || '').replace(/\/+$/, '')
  const path = (url || '').replace(/^\/+/, '')
  if (!path) return base || '/'
  return `${base}/${path}`
}

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * Axios adds `params` to the final URL after request interceptors run. The
 * proxy receives the real path through the `url` header, so serialize the
 * params here or filters such as `active=true` are silently dropped.
 */
export function buildRequestPath(config: {
  url?: string
  baseURL?: string
  params?: unknown
}): string {
  return api.getUri({
    ...config,
    baseURL: config.baseURL ?? API_BASE
  })
}

api.interceptors.request.use((config) => {
  const requestPath = buildRequestPath(config)

  config.headers = config.headers ?? new AxiosHeaders()
  config.headers.set('url', requestPath)
  config.headers.set('user-token', getToken())

  // The proxy endpoint is served from the frontend origin, so bypass the
  // /api base URL when rewriting the request. The query is already encoded in
  // the `url` header.
  config.baseURL = ''
  config.url = PROXY_URL
  config.params = undefined
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error))
)

function userHeaders(): Record<string, string> {
  return {
    'user-token': getToken()
  }
}

export const userApi = {
  async check(): Promise<number> {
    const response = await axios.get<UserStatusResponse>(USER_URL, {
      headers: userHeaders(),
      timeout: 15000
    })
    return response.data.status
  },

  async login(): Promise<number> {
    const response = await axios.post<UserStatusResponse>(USER_URL, undefined, {
      headers: userHeaders(),
      timeout: 15000
    })
    return response.data.status
  }
}
