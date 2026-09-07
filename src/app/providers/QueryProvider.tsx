import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { isAuthError } from '@/shared/api/types'

/** 기본 정책은 docs/architecture.md 4절. */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000, // 1분. 자주 바뀌는 목록은 각 훅에서 0~30초로 낮춘다
        retry: (failureCount, error) => !isAuthError(error) && failureCount < 1,
      },
      mutations: { retry: 0 },
    },
  })
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
