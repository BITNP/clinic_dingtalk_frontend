/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  readonly VITE_PROXY_URL?: string
  readonly VITE_USER_URL?: string
  readonly VITE_DEV_USER?: string
  readonly VITE_CLINIC_TIME_ZONE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
