import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { callFeedbackKeys, callFeedbackPaths } from '@/shared/api/callFeedback/paths'
import type { CallSttUploadResponse } from '@/shared/api/callFeedback/types'

export type UploadCallRecordingInput = {
  callId: number
  blob: Blob
  filename: string
  startedAt: string
}

/**
 * 통화 녹음 업로드 — `POST /api/v1/call/{callId}/stt`
 *
 * 서버는 파일을 받자마자 응답하고 분석은 따로 한다. 결과는 진행 상태 조회로 본다.
 * Content-Type은 브라우저가 boundary와 함께 붙이므로 직접 넣지 않는다.
 */
export function useUploadCallRecording() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ callId, blob, filename, startedAt }: UploadCallRecordingInput) => {
      const form = new FormData()
      form.append('file', blob, filename)
      form.append('startedAt', startedAt)
      return api.post<CallSttUploadResponse>(callFeedbackPaths.stt(callId), form)
    },
    onSuccess: (_data, { callId }) => {
      queryClient.invalidateQueries({ queryKey: callFeedbackKeys.status(callId) })
      queryClient.invalidateQueries({ queryKey: callFeedbackKeys.recent })
    },
  })
}
