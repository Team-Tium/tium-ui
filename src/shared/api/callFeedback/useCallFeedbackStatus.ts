import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { ApiError, isAuthError } from '@/shared/api/types'
import { callFeedbackKeys, callFeedbackPaths } from './paths'
import type { CallFeedbackStatusResponse } from './types'

const POLL_MS = 3000

/** 더 바뀌지 않거나 사용자가 움직여야 바뀌는 상태. 여기서는 조회를 멈춘다. */
const SETTLED = new Set(['READY', 'DONE', 'FAILED'])

/** 통화가 없거나 참여자가 아니다. 다시 물어도 답이 같다. */
const NO_ACCESS = new Set(['CALL404', 'CALL4031'])

/**
 * 통화 피드백 진행 상태 — `GET /api/v1/call/{callId}/feedback/status`
 *
 * 화면이 보일 때만 3초마다 조회하고, 멈출 상태가 되거나 조회가 실패하면 멈춘다.
 * 화면에 다시 들어오거나 포커스가 돌아오면 한 번 새로 조회한다.
 */
export function useCallFeedbackStatus(callId: number, { enabled = true } = {}) {
  return useQuery({
    queryKey: callFeedbackKeys.status(callId),
    queryFn: ({ signal }) =>
      api.get<CallFeedbackStatusResponse>(callFeedbackPaths.status(callId), { signal }),
    enabled: enabled && Number.isFinite(callId),
    staleTime: 0,
    retry: (failureCount, error) =>
      !isAuthError(error) &&
      !(error instanceof ApiError && NO_ACCESS.has(error.code)) &&
      failureCount < 1,
    refetchOnWindowFocus: 'always',
    refetchIntervalInBackground: false,
    refetchInterval: (query) => {
      if (query.state.status === 'error') return false
      const status = query.state.data?.status
      return status !== undefined && SETTLED.has(status) ? false : POLL_MS
    },
  })
}
