import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { userApi } from '@/api/client'
import { errorMessage } from '@/api/errors'
import { clearToken, getToken, setToken } from '@/auth/token'
import { createDingTalkClient, type DingTalkClient } from '@/platform/dingtalk'

export type SessionState = 'idle' | 'loading' | 'ready' | 'error'

export function readCorpId(search: string = location.search): string {
  return new URLSearchParams(search).get('corpId') ?? ''
}

export const useSessionStore = defineStore('session', () => {
  const state = ref<SessionState>('idle')
  const error = ref('')
  const token = ref(getToken())
  const ready = computed(() => state.value === 'ready')

  let dingtalk: DingTalkClient = createDingTalkClient()

  function setDingTalkClient(client: DingTalkClient): void {
    dingtalk = client
  }

  async function ensure(): Promise<boolean> {
    if (state.value === 'ready') return true
    if (state.value === 'loading') return false

    state.value = 'loading'
    error.value = ''

    try {
      const status = await userApi.check()
      if (status === 200) {
        token.value = getToken()
        state.value = 'ready'
        return true
      }

      const corpId = readCorpId()
      if (!corpId) {
        throw new Error('请在钉钉中打开本页面，或使用本地开发账号')
      }

      clearToken()
      token.value = ''

      const code = await dingtalk.requestAuthCode(corpId)
      setToken(code)
      token.value = code

      const loginStatus = await userApi.login()
      if (loginStatus !== 200) {
        clearToken()
        token.value = ''
        throw new Error('登录失败，请重试')
      }

      state.value = 'ready'
      return true
    } catch (caught) {
      state.value = 'error'
      error.value = errorMessage(caught, '登录失败，请重试')
      return false
    }
  }

  function retry(): Promise<boolean> {
    state.value = 'idle'
    return ensure()
  }

  return { state, error, token, ready, ensure, retry, setDingTalkClient }
})
