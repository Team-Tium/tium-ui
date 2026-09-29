/** 통화 피드백 진행 상태. */
export type CallFeedbackStatus =
  | 'WAITING_RECORDING'
  | 'ANALYZING'
  | 'READY'
  | 'GENERATING'
  | 'DONE'
  | 'FAILED'
