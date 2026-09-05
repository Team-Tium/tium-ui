import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/app/providers/auth-context'

/** 토큰이 없으면 로그인으로 보낸다. docs/auth_flow.md 7절 */
export function RequireAuth() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

/**
 * 온보딩을 안 끝냈으면 온보딩으로 보낸다.
 * 지금은 localStorage 값으로 판단한다. users 명세가 나오면 GET /users/me 로 바꾼다.
 * docs/auth_flow.md 7절
 */
export function RequireOnboarding() {
  const { onboardingCompleted } = useAuth()
  if (!onboardingCompleted) return <Navigate to="/onboarding/phone" replace />
  return <Outlet />
}
