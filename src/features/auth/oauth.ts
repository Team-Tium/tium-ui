import type { Provider } from './types'

/**
 * 소셜 로그인 — 인가코드 리다이렉트 방식(B안). docs/auth_flow.md 1·3·4절
 *
 * 프론트에 소셜 SDK를 붙이지 않는다. 버튼을 누르면 provider 인가 페이지로 통째로 이동하고,
 * 돌아온 code 를 콜백 화면(/auth/callback/:provider)이 백엔드에 넘긴다.
 */

const OAUTH_STATE_KEY = 'tium.oauthState'

type ProviderConfig = {
  authorizeUrl: string
  clientId: string
  /** 구글만 scope 가 필요하다. docs/auth_flow.md 3절 */
  scope?: string
}

const CONFIG: Record<Provider, ProviderConfig> = {
  google: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    scope: 'openid email profile',
  },
  kakao: {
    authorizeUrl: 'https://kauth.kakao.com/oauth/authorize',
    clientId: import.meta.env.VITE_KAKAO_CLIENT_ID,
  },
  naver: {
    authorizeUrl: 'https://nid.naver.com/oauth2.0/authorize',
    clientId: import.meta.env.VITE_NAVER_CLIENT_ID,
  },
}

/** 콜백에서 URL 의 state 와 대조한다. 다르면 로그인 중단. docs/auth_flow.md 4·9절 */
export function readOAuthState(): string | null {
  return sessionStorage.getItem(OAUTH_STATE_KEY)
}

export function clearOAuthState(): void {
  sessionStorage.removeItem(OAUTH_STATE_KEY)
}

/**
 * provider 인가 URL 을 만든다. state 를 생성해 sessionStorage 에 저장하는 부수효과가 있다.
 *
 * redirect_uri 는 현재 origin 기준이라 로컬·프리뷰·운영이 각자 자기 주소로 돌아온다.
 * 단 그 주소가 provider 콘솔에 등록돼 있어야 한다. docs/auth_flow.md 3절
 */
export function buildAuthorizeUrl(provider: Provider): string {
  const { authorizeUrl, clientId, scope } = CONFIG[provider]

  const state = crypto.randomUUID()
  sessionStorage.setItem(OAUTH_STATE_KEY, state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: `${window.location.origin}/auth/callback/${provider}`,
    state,
  })
  if (scope) params.set('scope', scope)

  return `${authorizeUrl}?${params.toString()}`
}
