import { api } from '@/shared/api/client'
import type { Session } from '@/shared/lib/tokenStorage'

/**
 * 개발 전용 — 소셜 로그인을 건너뛰고 테스트 계정의 정식 토큰을 받는다.
 * 백엔드 계약: DevAuthController — POST /dev/auth/token { providerId } → 회원 없으면 생성.
 *
 * `import.meta.env.DEV` 밖에서 부르지 않는다. LoginPage 가 동적 import 로만 불러
 * 운영 번들에는 이 파일이 포함되지 않는다.
 * 배포 전 확인: docs/architecture.md 6-4 「/dev/auth/token 호출이 남아 있지 않은가」
 */
export async function fetchDevSession(): Promise<Session> {
  const providerId = import.meta.env.VITE_DEV_PROVIDER_ID

  const { memberId, accessToken, refreshToken } = await api.post<{
    memberId: number
    accessToken: string
    refreshToken: string
    isNewMember: boolean
    onboardingCompleted: boolean
  }>('/dev/auth/token', { providerId })

  // 온보딩 완료 여부는 서버(GET /users/me)가 판정한다. 여기서 정하지 않는다.
  // 테스트 계정이 온보딩 미완료면 가드가 /onboarding/profile 로 보낸다. docs/auth_flow.md 7절
  return { memberId, accessToken, refreshToken }
}
