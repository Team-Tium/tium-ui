import { useMutation } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import type { Session } from '@/shared/lib/tokenStorage'
import type { Provider } from '../types'

/** 요청 바디. docs/auth_api.md 1절 */
interface SocialLoginRequest {
  provider: Provider
  /** provider 가 리다이렉트로 돌려준 인가 코드 */
  authorizationCode: string
}

/** 응답 result. 봉투(isSuccess/code/message/result)는 인터셉터가 벗긴다. */
interface LoginResult {
  memberId: number
  accessToken: string
  refreshToken: string
  /** 환영 문구 등 UX 용도. 라우팅 기준으로 쓰지 않는다. docs/auth_api.md 1절 */
  isNewMember: boolean
  onboardingCompleted: boolean
}

/**
 * 소셜 로그인 완결 — `POST /auth/login/{provider}` · docs/auth_flow.md 5절 · docs/auth_api.md 1절
 *
 * 인가코드 리다이렉트 방식(B안)이라 `token` 은 항상 null 이다. 프론트에 소셜 SDK 를 붙이지 않는다.
 *
 * 세션 저장과 라우팅은 이 훅이 하지 않는다 — 콜백 화면이 실패 경로까지 한곳에서 다루도록
 * `OAuthCallbackPage` 에 모아뒀다. docs/auth_flow.md 9절
 */
export function useSocialLogin() {
  return useMutation({
    mutationFn: async ({ provider, authorizationCode }: SocialLoginRequest): Promise<Session> => {
      const { memberId, accessToken, refreshToken, onboardingCompleted } =
        await api.post<LoginResult>(`/auth/login/${provider}`, {
          token: null,
          authorizationCode,
        })

      return { memberId, accessToken, refreshToken, onboardingCompleted }
    },
    // 인가코드는 한 번 쓰면 폐기된다. 재시도하면 두 번째는 반드시 실패한다.
    // QueryProvider 의 mutations.retry 가 이미 0 이지만 이유가 있는 값이라 명시해둔다.
    retry: 0,
  })
}
