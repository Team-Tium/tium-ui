import { useQuery } from '@tanstack/react-query'

import { callFeedbackKeys, callFeedbackPaths } from '@/shared/api/callFeedback/paths'
import type { CallFeedbackResponse } from '@/shared/api/callFeedback/types'
import { api } from '@/shared/api/client'
import { retryExcept } from './errorCode'

/**
 * 통화 피드백 본문 — `GET /api/v1/call/{callId}/feedback`
 *
 * 진행 상태가 완성일 때만 부른다. 한 번 만들어진 본문은 바뀌지 않는다.
 */
export function useCallFeedback(callId: number, { enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: callFeedbackKeys.detail(callId),
    queryFn: ({ signal }) =>
      api.get<CallFeedbackResponse>(callFeedbackPaths.feedback(callId), { signal }),
    enabled: enabled && Number.isFinite(callId),
    staleTime: Infinity,
    retry: retryExcept('FEEDBACK404', 'CALL404', 'CALL4031'),
  })
}
