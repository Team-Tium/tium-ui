/** 통화 피드백 API 경로. 통화 종료 화면과 피드백 화면이 같이 쓴다. */
const BASE = '/api/v1/call'

export const callFeedbackPaths = {
  stt: (callId: number) => `${BASE}/${callId}/stt`,
  feedback: (callId: number) => `${BASE}/${callId}/feedback`,
  status: (callId: number) => `${BASE}/${callId}/feedback/status`,
  recent: `${BASE}/feedback/recent`,
}

export const callFeedbackKeys = {
  status: (callId: number) => ['feedback', 'call-status', callId] as const,
  detail: (callId: number) => ['feedback', 'call-detail', callId] as const,
  stt: (callId: number) => ['feedback', 'call-stt', callId] as const,
  recent: ['feedback', 'recent-calls'] as const,
}

/** 통화 피드백 결과 화면 주소. */
export const callFeedbackHref = (callId: number) => `/feedback/call/${callId}`
