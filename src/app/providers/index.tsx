import type { ReactNode } from 'react'

import { AuthProvider } from './AuthProvider'
import { QueryProvider } from './QueryProvider'
import { SocketProvider } from './SocketProvider'

/**
 * AuthProvider 는 queryClient 를 쓰므로 QueryProvider 안쪽에 있어야 한다.
 * SocketProvider 는 로그인 여부를 보고 연결하므로 AuthProvider 안쪽에 있어야 한다.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <SocketProvider>{children}</SocketProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
