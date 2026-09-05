import type { ReactNode } from 'react'

import { AuthProvider } from './AuthProvider'
import { QueryProvider } from './QueryProvider'

/** AuthProvider 는 queryClient 를 쓰므로 QueryProvider 안쪽에 있어야 한다. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  )
}
