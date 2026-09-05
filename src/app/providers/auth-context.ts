import { createContext, useContext } from 'react'

import type { Session } from '@/shared/lib/tokenStorage'

export type AuthValue = {
  isAuthenticated: boolean
  memberId: number | null
  /** 임시 조치다. users 명세가 나오면 GET /users/me 로 바꾼다. docs/auth_flow.md 7절 */
  onboardingCompleted: boolean
  /** 로그인 응답을 받은 뒤 부른다. */
  startSession: (session: Session) => void
  /** 온보딩 마지막 단계를 끝낸 뒤 부른다. */
  completeOnboarding: () => void
  /** 로그아웃·탈퇴에서 부른다. */
  endSession: () => void
}

export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth 는 AuthProvider 안에서만 쓸 수 있다.')
  return value
}
