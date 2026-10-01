import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query'

import { callFeedbackKeys, callFeedbackPaths } from '@/shared/api/callFeedback/paths'
import type { CallFeedbackResponse } from '@/shared/api/callFeedback/types'
import { api } from '@/shared/api/client'

const generateKey = (callId: number) => ['feedback', 'call-generate', callId] as const

/**
 * 통화 피드백 만들기 — `POST /api/v1/call/{callId}/feedback` (본문 없음)
 *
 * 응답까지 수십 초 걸린다. 캐시 갱신은 여기 둬야 화면을 떠나도 끝까지 실행된다.
 */
export function useGenerateCallFeedback(callId: number) {
  const queryClient = useQueryClient()
  const refreshStatus = () =>
    queryClient.invalidateQueries({ queryKey: callFeedbackKeys.status(callId) })

  const mutation = useMutation({
    mutationKey: generateKey(callId),
    mutationFn: () => api.post<CallFeedbackResponse>(callFeedbackPaths.feedback(callId)),
    onMutate: () => {
      void refreshStatus()
    },
    onSuccess: (feedback) => {
      queryClient.setQueryData(callFeedbackKeys.detail(callId), feedback)
      void refreshStatus()
      void queryClient.invalidateQueries({ queryKey: callFeedbackKeys.recent })
    },
    // 응답 없이 끊겨도 서버는 계속 만들고 있을 수 있다. 어떤 실패든 진행 상태를 다시 본다.
    onError: () => {
      void refreshStatus()
    },
  })

  /**
   * 이미 보낸 요청이 있으면 다시 보내지 않는다.
   * 화면 상태는 한 박자 늦게 바뀌어 연타를 못 막으므로 뮤테이션 캐시를 바로 확인한다.
   */
  const generate = () => {
    const inFlight = queryClient
      .getMutationCache()
      .findAll({ mutationKey: generateKey(callId), exact: true })
      .some((m) => m.state.status === 'idle' || m.state.status === 'pending')
    if (!inFlight) mutation.mutate()
  }

  return { ...mutation, generate }
}

/** 이 통화의 피드백을 만드는 요청이 아직 진행 중인지. 화면을 나갔다 와도 유지된다. */
export function useIsGeneratingCallFeedback(callId: number) {
  return useIsMutating({ mutationKey: generateKey(callId) }) > 0
}
