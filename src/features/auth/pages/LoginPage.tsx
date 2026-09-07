import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/app/providers/auth-context'
import { SocialLoginButton } from '../components/SocialLoginButton'
import { PROVIDERS } from '../types'

/**
 * 개발용 — Tium 로고 더블클릭 시 테스트 토큰으로 로그인하고 홈으로 보낸다.
 * 운영 빌드에서는 `import.meta.env.DEV` 가 false 라 undefined 를 반환해 아무 일도 안 한다.
 * devAuth 는 동적 import 라 운영 번들에 포함되지 않는다.
 */
function useDevLogin(): (() => void) | undefined {
  const navigate = useNavigate()
  const { startSession } = useAuth()

  if (!import.meta.env.DEV) return undefined

  return async () => {
    try {
      const { fetchDevSession } = await import('../devAuth')
      startSession(await fetchDevSession())
      navigate('/', { replace: true })
    } catch (error) {
      console.error('[dev] 개발용 로그인 실패', error)
      window.alert(
        `개발용 로그인 실패. 백엔드(${import.meta.env.VITE_API_BASE_URL})가 떠 있는지 확인하세요.`,
      )
    }
  }
}

/**
 * 로그인 — /login · docs/ia.md 1절 · docs/auth_flow.md
 *
 * 소셜 버튼 3개만. 자체 로그인(아이디/비번)은 범위에서 빠졌다.
 * 피그마 Login page 1 (143:701)에서 입력·찾기·「또는」 구분선은 뺐다.
 */
export default function LoginPage() {
  const devLogin = useDevLogin()

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-10 px-6">
      <header className="text-center">
        <p
          className={`text-primary text-3xl font-bold tracking-tight ${devLogin ? 'cursor-pointer' : ''}`}
          onDoubleClick={devLogin}
          title={devLogin ? '더블클릭: 개발용 로그인' : undefined}
        >
          Tium
        </p>
        <p className="text-muted-foreground mt-2 text-sm">말을 틔우다</p>
      </header>

      <div className="flex flex-col gap-3">
        {PROVIDERS.map((provider) => (
          <SocialLoginButton key={provider} provider={provider} />
        ))}
      </div>
    </div>
  )
}
