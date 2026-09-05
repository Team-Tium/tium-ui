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
  const [onboardingCompleted, setOnboardingCompleted] = useState(() =>
    tokenStorage.getOnboardingCompleted(),
  )

  const startSession = useCallback((session: Session) => {
    tokenStorage.saveSession(session)
    setMemberId(session.memberId)
    setHasToken(true)
    setOnboardingCompleted(session.onboardingCompleted)
  }, [])

  const completeOnboarding = useCallback(() => {
    tokenStorage.setOnboardingCompleted(true)
    setOnboardingCompleted(true)
  }, [])

  const endSession = useCallback(() => {
    tokenStorage.clear()
    setMemberId(null)
    setHasToken(false)
    setOnboardingCompleted(false)
    // 비우지 않으면 다음 사용자가 이전 사용자의 데이터를 잠깐 본다. docs/auth_flow.md 8절
    queryClient.clear()
    // TODO: 소켓이 생기면 여기서 구독 해제 후 연결 종료. docs/chat_socket.md 7절
  }, [queryClient])

  const value = useMemo<AuthValue>(
    () => ({
      isAuthenticated: hasToken,
      memberId,
      onboardingCompleted,
      startSession,
      completeOnboarding,
      endSession,
    }),
    [hasToken, memberId, onboardingCompleted, startSession, completeOnboarding, endSession],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
