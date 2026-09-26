import { useMutation } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import type { CallResult } from '../types'

/**
 * 통화 종료 — `POST /api/v1/call/{callId}/end` · docs/call_api.md 2번
 *
 * 둘 중 한 명만 부르면 된다. 상대 화면은 소켓의 CALL_ENDED로 안다.
 * 수락 전에 부르면 서버가 CANCELED로 저장한다.
 */
export function useEndCall() {
  return useMutation({
    mutationFn: (callId: number) => api.post<CallResult>(`/api/v1/call/${callId}/end`),
  })
}
