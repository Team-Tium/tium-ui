import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import type { FeedHeartHistory } from '../types'
import { feedKeys } from './feedKeys'

/**
 * 하트 기록 — `GET /api/v1/feed/heart`
 *
 * 글별로 나눠 주지 않아 한 번에 전부 받고, 화면에서 글 ID로 거른다. 팝업을 열 때만 부른다.
 */
export function useHeartHistory({ enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: feedKeys.hearts,
    queryFn: ({ signal }) => api.get<FeedHeartHistory[]>('/api/v1/feed/heart', { signal }),
    enabled,
  })
}
