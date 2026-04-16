/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SYNORA_BASE_URL?: string
  readonly VITE_SYNORA_EVENT_TOPIC?: string
  readonly VITE_SYNORA_MAIL_TEMPLATE?: string
  readonly VITE_SYNORA_PROJECT_ID?: string
  readonly VITE_USERCENTER_BASE_URL?: string
  readonly VITE_USERCENTER_PROJECT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
