import { useQuery } from '@tanstack/react-query'

import type { CallFeedbackResponse } from '@/shared/api/callFeedback/types'
import { api } from '@/shared/api/client'
import { chatFeedbackKeys, chatFeedbackPaths } from './chatFeedbackKeys'
import { retryExcept } from './errorCode'

/**
 * 채팅 피드백 본문 — `GET /chats/{roomId}/feedback`
 *
 * 아직 만들지 않았으면 에러(FEEDBACK404)로 온다. 응답 모양은 통화 피드백과 같다.
 */
export function useChatFeedback(roomId: number, { enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: chatFeedbackKeys.detail(roomId),
    queryFn: ({ signal }) =>
      api.get<CallFeedbackResponse | null>(chatFeedbackPaths.feedback(roomId), { signal }),
    enabled: enabled && Number.isFinite(roomId),
    staleTime: Infinity,
    retry: retryExcept('FEEDBACK404', 'CHAT4041', 'CHAT4031'),
  })
}
