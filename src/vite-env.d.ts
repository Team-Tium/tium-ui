/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_BASE_URL: string
  readonly VITE_KAKAO_CLIENT_ID: string
  readonly VITE_NAVER_CLIENT_ID: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  /** 개발 전용 — POST /dev/auth/token 에 넘길 테스트 회원 식별자(providerId). 운영에선 안 쓴다. */
  readonly VITE_DEV_PROVIDER_ID: string
  /**
   * 배포본에서 개발용 로그인(로고 더블클릭)을 열지 여부. `'true'` 일 때만 열린다.
   * 로컬은 이 값 없이도 열린다(`import.meta.env.DEV`). Production 에는 넣지 않는다.
   */
  readonly VITE_DEV_LOGIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
