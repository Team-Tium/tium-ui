import { useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'

import { useAuth } from '@/app/providers/auth-context'
import { useSocialLogin } from '../api/useSocialLogin'
import { clearOAuthState, readOAuthState } from '../oauth'
import { PROVIDERS, type Provider } from '../types'

function isProvider(value: string | undefined): value is Provider {
  return PROVIDERS.includes(value as Provider)
}

/**
 * 소셜 콜백 — /auth/callback/:provider · docs/auth_flow.md 5·9절
 *
 * provider 가 돌려준 code 를 백엔드에 넘겨 로그인을 완결한다.
 * 사용자가 보는 시간은 1초 미만이라 UI 는 스피너 하나다.
 *
 * **모든 실패는 /login 으로 돌려보낸다.** 여기 머무르게 하지 않는다 —
 * 사용자가 할 수 있는 행동이 "다시 로그인" 뿐이기 때문이다. docs/auth_flow.md 9절
 */
export default function OAuthCallbackPage() {
  const { provider } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { startSession } = useAuth()
  const { mutate } = useSocialLogin()

  // 한 번만 실행한다. StrictMode 의 이중 실행과, 콜백 새로고침으로 인가코드를 두 번 쓰는 것을 막는다.
  // 두 번째 호출은 백엔드에서 실패하므로 가드가 없으면 성공 직후 /login 으로 튕긴다. 9절
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    /** 실패 사유는 state 로 넘긴다. 토스트는 나중에. docs/schedule.md */
    function backToLogin(error?: string) {
      navigate('/login', { replace: true, state: error ? { error } : undefined })
    }

    // 1. 동의를 거부하면 code 대신 error 가 온다 (예: access_denied)
    if (searchParams.get('error')) {
      backToLogin('로그인이 취소됐어요.')
      return
    }

    // 2. state 대조 (CSRF). 저장값은 쓰든 안 쓰든 지운다. docs/auth_flow.md 4절
    const savedState = readOAuthState()
    clearOAuthState()

    const state = searchParams.get('state')
    if (!state || state !== savedState) {
      // 조용히 중단한다. 사용자에게 설명할 만한 사유가 아니다. 9절
      backToLogin()
      return
    }

    // 3. 주소가 망가진 경우. /login 에서 정상적으로 왔다면 둘 다 있다
    const code = searchParams.get('code')
    if (!isProvider(provider) || !code) {
      backToLogin()
      return
    }

    mutate(
      { provider, authorizationCode: code },
      {
        onSuccess: ({ memberId, accessToken, refreshToken, onboardingCompleted }) => {
          startSession({ memberId, accessToken, refreshToken })

          // TODO: 소켓이 생기면 여기서 연결한다. docs/auth_flow.md 5절 4단계 · docs/chat_socket.md

          // 로그인 직후 분기는 응답 값으로 한다. 여기서 GET /users/me 를 또 부르지 않는다.
          // 라우팅 기준은 onboardingCompleted 하나다 — isNewMember 를 쓰지 않는다.
          // (온보딩 중 이탈하면 isNewMember=false, onboardingCompleted=false 조합이 생긴다) 7절
          navigate(onboardingCompleted ? '/' : '/onboarding/profile', { replace: true })
        },
        // code 만료·재사용, 네트워크 실패가 전부 여기로 온다.
        // 메시지는 인터셉터가 이미 사람이 읽을 문장으로 만들어 둔다. shared/api/client.ts
        onError: (error) => backToLogin(error.message),
      },
    )
  }, [provider, searchParams, navigate, startSession, mutate])

  return (
    <div
      className="flex min-h-svh items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <LoaderCircle className="text-primary size-8 animate-spin" />
      <span className="sr-only">로그인 중이에요</span>
    </div>
  )
}
