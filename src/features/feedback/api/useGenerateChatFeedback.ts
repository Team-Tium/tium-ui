import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query'

import type { CallFeedbackResponse } from '@/shared/api/callFeedback/types'
import { api } from '@/shared/api/client'
import { chatFeedbackKeys, chatFeedbackPaths } from './chatFeedbackKeys'

const generateKey = (roomId: number) => ['feedback', 'chat-generate', roomId] as const

/**
 * 채팅 피드백 만들기 — `POST /chats/{roomId}/feedback` (본문 없음)
 *
 * 응답에 결과 본문이 바로 온다. 캐시 갱신은 여기 둬야 화면을 떠나도 끝까지 실행된다.
 */
export function useGenerateChatFeedback(roomId: number) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationKey: generateKey(roomId),
    mutationFn: () => api.post<CallFeedbackResponse>(chatFeedbackPaths.feedback(roomId)),
    onSuccess: (feedback) => {
      queryClient.setQueryData(chatFeedbackKeys.detail(roomId), feedback)
      void queryClient.invalidateQueries({ queryKey: chatFeedbackKeys.recent })
    },
    // 응답 없이 끊겨도 서버는 만들었을 수 있다. 어떤 실패든 결과를 다시 본다.
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: chatFeedbackKeys.detail(roomId) })
    },
  })

  /**
   * 이미 보낸 요청이 있으면 다시 보내지 않는다.
   * 화면 상태는 한 박자 늦게 바뀌어 연타를 못 막으므로 뮤테이션 캐시를 바로 확인한다.
   */
  const generate = () => {
    const inFlight = queryClient
      .getMutationCache()
      .findAll({ mutationKey: generateKey(roomId), exact: true })
      .some((m) => m.state.status === 'idle' || m.state.status === 'pending')
    if (!inFlight) mutation.mutate()
  }

  return { ...mutation, generate }
}

/** 이 채팅의 피드백을 만드는 요청이 아직 진행 중인지. 화면을 나갔다 와도 유지된다. */
export function useIsGeneratingChatFeedback(roomId: number) {
  return useIsMutating({ mutationKey: generateKey(roomId) }) > 0
}
