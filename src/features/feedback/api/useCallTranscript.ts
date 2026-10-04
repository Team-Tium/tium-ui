import { useQuery } from '@tanstack/react-query'

import { callFeedbackKeys, callFeedbackPaths } from '@/shared/api/callFeedback/paths'
import type { CallSttResponse } from '@/shared/api/callFeedback/types'
import { api } from '@/shared/api/client'
import { retryExcept } from './errorCode'

/**
 * 분석된 대화 내용 — `GET /api/v1/call/{callId}/stt`
 *
 * 대화 내용을 펼쳤을 때만 부른다.
 */
export function useCallTranscript(callId: number, { enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: callFeedbackKeys.stt(callId),
    queryFn: ({ signal }) => api.get<CallSttResponse>(callFeedbackPaths.stt(callId), { signal }),
    enabled: enabled && Number.isFinite(callId),
    staleTime: Infinity,
    retry: retryExcept('CALL_STT4041', 'CALL404', 'CALL4031'),
  })
}
