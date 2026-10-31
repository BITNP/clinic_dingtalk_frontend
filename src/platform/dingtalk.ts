export interface DingTalkClient {
  /**
   * Resolve the DingTalk auth code, rejecting if the JSAPI never becomes ready,
   * never calls back, or reports a failure.
   */
  requestAuthCode(corpId: string, timeoutMs?: number): Promise<string>
}

interface DingTalkSdk {
  ready(callback: () => void): void
  runtime: {
    permission: {
      requestAuthCode(options: {
        corpId: string
        onSuccess: (info: { code: string }) => void
        onFail?: (error: unknown) => void
      }): void
    }
  }
}

function messageOf(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>
    for (const key of ['errorMessage', 'message']) {
      const value = record[key]
      if (typeof value === 'string' && value.trim()) return value
    }
  }
  return '钉钉授权失败，请重试'
}

async function loadSdk(): Promise<DingTalkSdk> {
  const module = await import('dingtalk-jsapi')
  return ((module as unknown as { default?: DingTalkSdk }).default ??
    module) as unknown as DingTalkSdk
}

export function createDingTalkClient(): DingTalkClient {
  return {
    async requestAuthCode(corpId, timeoutMs = 10000) {
      const dd = await loadSdk()

      return new Promise<string>((resolve, reject) => {
        let settled = false
        const timer = window.setTimeout(() => {
          if (settled) return
          settled = true
          reject(new Error('钉钉授权超时，请重试'))
        }, timeoutMs)

        const finish = (action: () => void) => {
          if (settled) return
          settled = true
          window.clearTimeout(timer)
          action()
        }

        try {
          dd.ready(() => {
            try {
              dd.runtime.permission.requestAuthCode({
                corpId,
                onSuccess: (info) => finish(() => resolve(info.code)),
                onFail: (error) => finish(() => reject(new Error(messageOf(error))))
              })
            } catch (error) {
              finish(() => reject(new Error(messageOf(error))))
            }
          })
        } catch (error) {
          finish(() => reject(new Error(messageOf(error))))
        }
      })
    }
  }
}
