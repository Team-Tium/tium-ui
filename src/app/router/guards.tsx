import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/app/providers/auth-context'
import { useMe } from '@/features/auth/api/useMe'
import { RouteFallback } from '@/shared/components/RouteFallback'

/** 토큰이 없으면 로그인으로 보낸다. docs/auth_flow.md 7절 */
export function RequireAuth() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

/**
 * 온보딩을 안 끝냈으면 온보딩으로 보낸다. docs/auth_flow.md 7절
 *
 * 판정 출처는 서버뿐이다 — `GET /users/me` 의 onboardingCompleted.
 * 로그인 직후 분기는 콜백 화면이 로그인 응답으로 이미 끝냈고,
 * 여기서 처리하는 건 새로고침과 주소 직접 진입이다.
 *
 * 온보딩 라우트(`/onboarding/*`)는 이 가드 밖에 있다 — 거기가 온보딩을 끝내러 가는 곳이다.
 */
export function RequireOnboarding() {
  const { data, isPending, isError } = useMe()

  if (isPending) return <RouteFallback />
  // 401 은 인터셉터가 이미 로그인 화면으로 보낸다. 여기 오는 건 그 밖의 실패다.
  if (isError) return <Navigate to="/login" replace />
  if (!data.onboardingCompleted) return <Navigate to="/onboarding/profile" replace />

  return <Outlet />
}
