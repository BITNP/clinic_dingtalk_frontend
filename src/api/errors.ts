import axios from 'axios'

export class ApiError extends Error {
  readonly status?: number
  readonly data?: unknown

  constructor(message: string, status?: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function extractMessage(data: unknown): string {
  if (typeof data === 'string' && data.trim()) {
    return data
  }
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    for (const key of ['msg', 'error', 'message']) {
      const value = record[key]
      if (typeof value === 'string' && value.trim()) {
        return value
      }
    }
  }
  return ''
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data
    const message =
      extractMessage(data) ||
      (status ? `请求失败（${status}）` : '网络连接失败，请稍后重试')
    return new ApiError(message, status, data)
  }
  if (error instanceof Error) {
    return new ApiError(error.message)
  }
  return new ApiError('操作失败，请稍后重试')
}

export function errorMessage(error: unknown, fallback = '操作失败，请稍后重试'): string {
  const message = toApiError(error).message
  return message || fallback
}
