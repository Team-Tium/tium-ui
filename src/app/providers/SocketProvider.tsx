import { useEffect, type ReactNode } from 'react'

import { useAuth } from './auth-context'
import { socketClient } from '@/shared/socket/client'
import { socketDestination } from '@/shared/socket/events'
import { useSubscription } from '@/shared/socket/useSubscription'

/**
 * 로그인해 있는 동안 소켓 연결을 하나 유지한다.
 *
 * 개인 알림 주소는 로그인 내내 듣는다. 전화는 어느 화면에 있든 와야 하고,
 * 채팅 목록도 방에 들어가 있지 않을 때 갱신돼야 하기 때문이다.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, memberId } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) return
    socketClient.connect()
    return () => socketClient.disconnect()
  }, [isAuthenticated])

  // 받은 이벤트를 처리하는 곳은 각 화면이다. 여기서는 주소를 열어두기만 한다.
  useSubscription(
    isAuthenticated && memberId !== null ? socketDestination.user(memberId) : null,
    () => {},
  )

  return children
}
