import { createContext, useContext } from 'react'

import type { Session } from '@/shared/lib/tokenStorage'

/**
 * 앱에서 유일한 전역 상태. 토큰 보유 여부만 들고 있다.
 *
 * 온보딩 완료 여부는 여기 없다 — 서버(`GET /users/me`)가 판정하고
 * `RequireOnboarding` 가드가 Query 캐시로 읽는다. docs/auth_flow.md 7절
 */
export type AuthValue = {
  isAuthenticated: boolean
  memberId: number | null
  /** 로그인 응답을 받은 뒤 부른다. */
  startSession: (session: Session) => void
  /** 로그아웃·탈퇴에서 부른다. */
  endSession: () => void
}

export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth 는 AuthProvider 안에서만 쓸 수 있다.')
  return value
}
