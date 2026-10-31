import { afterEach } from 'vitest'

function createMemoryStorage(): Storage {
  const values = new Map<string, string>()

  return {
    get length() {
      return values.size
    },
    clear() {
      values.clear()
    },
    getItem(key: string) {
      return values.get(key) ?? null
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null
    },
    removeItem(key: string) {
      values.delete(key)
    },
    setItem(key: string, value: string) {
      values.set(key, String(value))
    }
  }
}

// Node 26 exposes a non-functional global `localStorage` unless the process is
// started with --localstorage-file, which makes Vitest's jsdom environment skip
// the jsdom implementation. Provide a small in-memory stand-in for tests.
if (!globalThis.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: createMemoryStorage()
  })
}

afterEach(() => {
  globalThis.localStorage.clear()
})
