import { useInfiniteQuery } from '@tanstack/react-query'

import { callFeedbackKeys, callFeedbackPaths } from '@/shared/api/callFeedback/paths'
import type { RecentCallsResponse } from '@/shared/api/callFeedback/types'
import { api } from '@/shared/api/client'
import type { RecentCall } from '../types'

const PAGE_SIZE = 20

/** 결과 화면으로 갈 수 없는 항목(callId 없음)은 뺀다. */
function hasCallId(call: RecentCall): call is RecentCall & { callId: number } {
  return typeof call.callId === 'number'
}

/**
 * 피드백 탭의 최근 통화 — `GET /api/v1/call/feedback/recent`
 *
 * 커서 기반 무한 스크롤. 들어올 때마다 새로 받고, 항목별 진행 상태는 따로 조회하지 않는다.
 */
export function useRecentCalls() {
  return useInfiniteQuery({
    queryKey: callFeedbackKeys.recent,
    queryFn: ({ pageParam, signal }) =>
      api.get<RecentCallsResponse>(callFeedbackPaths.recent, {
        params: { size: PAGE_SIZE, ...(pageParam !== undefined ? { cursor: pageParam } : {}) },
        signal,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => (last.hasNext ? last.nextCursor : undefined),
    staleTime: 0,
    select: (data) => data.pages.flatMap((page) => (page.items ?? []).filter(hasCallId)),
  })
}
