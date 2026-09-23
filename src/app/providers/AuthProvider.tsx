import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { tokenStorage, type Session } from '@/shared/lib/tokenStorage'
import { AuthContext, type AuthValue } from './auth-context'

/**
 * 앱에서 유일한 전역 상태다. 인증 외에는 전역을 늘리지 않는다.
 * docs/architecture.md 1절
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const [memberId, setMemberId] = useState(() => tokenStorage.getMemberId())
  const [hasToken, setHasToken] = useState(() => tokenStorage.getAccessToken() !== null)

  const startSession = useCallback((session: Session) => {
    tokenStorage.saveSession(session)
    setMemberId(session.memberId)
    setHasToken(true)
  }, [])

  const endSession = useCallback(() => {
    tokenStorage.clear()
    setMemberId(null)
    setHasToken(false)
    // 비우지 않으면 다음 사용자가 이전 사용자의 데이터를 잠깐 본다. docs/auth_flow.md 8절
    queryClient.clear()
  }, [queryClient])

  const value = useMemo<AuthValue>(
    () => ({
      isAuthenticated: hasToken,
      memberId,
      startSession,
      endSession,
    }),
    [hasToken, memberId, startSession, endSession],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
