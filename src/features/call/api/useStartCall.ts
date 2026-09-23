import { useMutation } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import type { CallResult, CallStartRequest } from '../types'

/**
 * 통화 시작 — `POST /api/v1/call` · docs/call_api.md 1번
 *
 * 통화 기록을 만들 뿐이고 음성을 연결하지 않는다. 연결은 소켓 시그널링 + WebRTC가 한다.
 * 상대가 이미 통화 중이면 서버가 에러로 막는다. 전용 에러 코드가 아직 없어서
 * 화면은 실패하면 일반 안내 문구를 띄운다.
 */
export function useStartCall() {
  return useMutation({
    mutationFn: (body: CallStartRequest) => api.post<CallResult>('/api/v1/call', body),
  })
}
