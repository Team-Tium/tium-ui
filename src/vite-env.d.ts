/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_BASE_URL: string
  readonly VITE_KAKAO_CLIENT_ID: string
  readonly VITE_NAVER_CLIENT_ID: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  /** 개발 전용 — POST /dev/auth/token 에 넘길 테스트 회원 식별자(providerId). 운영에선 안 쓴다. */
  readonly VITE_DEV_PROVIDER_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
