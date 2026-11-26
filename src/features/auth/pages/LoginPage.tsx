import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/app/providers/auth-context'
import { SocialLoginButton } from '../components/SocialLoginButton'
import { TiumLogo } from '../components/TiumLogo'
import { PROVIDERS } from '../types'

/**
 * 개발용 로그인을 열지 말지. 빌드 타임 상수 둘의 조합이다.
 *
 * - 로컬(`npm run dev`)은 `DEV` 가 true 라 **항상** 열린다. 설정할 게 없다.
 * - 배포본은 `VITE_DEV_LOGIN=true` 를 넣은 빌드에서만 열린다.
 *   Vercel **Preview 스코프에만** 넣는다. Production(`main`)에는 넣지 않는다.
 *
 * 둘 다 false 면 이 상수가 false 로 접혀 아래 동적 import 까지 번들에서 빠진다.
 */
const DEV_LOGIN_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_DEV_LOGIN === 'true'

/**
 * 개발용 — Tium 로고 더블클릭 시 테스트 토큰으로 로그인하고 홈으로 보낸다.
 * 게이트가 닫혀 있으면 undefined 를 반환해 더블클릭에 아무 일도 일어나지 않는다.
 * docs/auth_flow.md 13절
 */
function useDevLogin(): (() => void) | undefined {
  const navigate = useNavigate()
  const { startSession } = useAuth()

  if (!DEV_LOGIN_ENABLED) return undefined

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

  // 콜백이 실패하면 사유를 navigate state 로 넘기고 여기로 돌려보낸다.
  // docs/auth_flow.md 9절 — 실패는 전부 /login 으로 오고, 콜백 화면에 머무르지 않는다.
  // 토스트가 생기면 그리로 옮긴다. docs/schedule.md 「진행 중인 작업」 8번
  const { state } = useLocation()
  const callbackError = (state as { error?: string } | null)?.error

  return (
    // 넓은 화면의 바깥 배경은 index.css 의 body 가 칠한다. 초록은 휴대폰 폭 칸 안에만 칠한다
    <div className="bg-primary flex min-h-svh flex-col">
      <header className="text-primary-foreground relative flex-1 overflow-hidden px-6 pt-14">
        {/* 배경 장식. 작은 로고를 아래 오른쪽으로 잘리게 깔고, 글보다 먼저 그려 뒤에 둔다 */}
        <TiumLogo className="text-primary-press pointer-events-none absolute -right-4 -bottom-6 text-[6rem] leading-none select-none" />

        <span
          className={`relative ${devLogin ? 'cursor-pointer' : ''}`}
          onDoubleClick={devLogin}
          title={devLogin ? '더블클릭: 개발용 로그인' : undefined}
        >
          <TiumLogo className="text-4xl" />
        </span>
        <h1 className="text-display relative mt-10 font-bold">
          말 한마디가
          <br />
          쉬워지는 곳
        </h1>
        <p className="text-body text-primary-foreground/75 relative mt-3">
          통화가 끝나면 AI가 대화를 돌아봐 줘요
        </p>
      </header>

      <div className="bg-card relative flex flex-col gap-3 rounded-t-3xl px-6 pt-8 pb-10">
        {callbackError && (
          <p role="alert" className="bg-destructive/10 text-destructive text-caption rounded-xl px-4 py-3 text-center">
            {callbackError}
          </p>
        )}

        {PROVIDERS.map((provider) => (
          <SocialLoginButton key={provider} provider={provider} />
        ))}
      </div>
    </div>
  )
}
