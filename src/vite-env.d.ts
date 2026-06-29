/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_URL: string
  readonly VITE_PAYSTACK_PUBLIC_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
