import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/api/client', () => ({
  userApi: {
    check: vi.fn(),
    login: vi.fn()
  }
}))

import { userApi } from '@/api/client'
import { useSessionStore } from '@/stores/session'

function setSearch(search: string): void {
  window.history.replaceState({}, '', `/${search}`)
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.mocked(userApi.check).mockReset()
  vi.mocked(userApi.login).mockReset()
  setSearch('?corpId=ding123')
})

afterEach(() => {
  setSearch('')
})

describe('session bootstrapping', () => {
  it('skips DingTalk when the proxy already knows the token', async () => {
    localStorage.setItem('user-token', 'existing-token')
    vi.mocked(userApi.check).mockResolvedValueOnce(200)

    const store = useSessionStore()
    const client = { requestAuthCode: vi.fn() }
    store.setDingTalkClient(client)

    await expect(store.ensure()).resolves.toBe(true)
    expect(store.state).toBe('ready')
    expect(client.requestAuthCode).not.toHaveBeenCalled()
  })

  it('exchanges the DingTalk auth code for a working token', async () => {
    vi.mocked(userApi.check).mockResolvedValueOnce(403)
    vi.mocked(userApi.login).mockResolvedValueOnce(200)

    const store = useSessionStore()
    const client = { requestAuthCode: vi.fn().mockResolvedValue('auth-code') }
    store.setDingTalkClient(client)

    await expect(store.ensure()).resolves.toBe(true)
    expect(store.state).toBe('ready')
    expect(client.requestAuthCode).toHaveBeenCalledWith('ding123')
    expect(localStorage.getItem('user-token')).toBe('auth-code')
  })

  it('surfaces an auth failure and allows a retry', async () => {
    vi.mocked(userApi.check).mockResolvedValue(403)
    vi.mocked(userApi.login).mockResolvedValue(200)

    const store = useSessionStore()
    store.setDingTalkClient({
      requestAuthCode: vi.fn().mockRejectedValue(new Error('钉钉授权超时'))
    })

    await expect(store.ensure()).resolves.toBe(false)
    expect(store.state).toBe('error')
    expect(store.error).toContain('钉钉授权超时')

    const retryClient = { requestAuthCode: vi.fn().mockResolvedValue('retry-code') }
    store.setDingTalkClient(retryClient)

    await expect(store.retry()).resolves.toBe(true)
    expect(store.state).toBe('ready')
  })

  it('fails clearly outside DingTalk and without a local dev token', async () => {
    setSearch('')
    vi.mocked(userApi.check).mockResolvedValueOnce(403)

    const store = useSessionStore()
    await expect(store.ensure()).resolves.toBe(false)
    expect(store.error).toContain('钉钉')
  })
})
