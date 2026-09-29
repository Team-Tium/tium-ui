import { useOutletContext } from 'react-router-dom'

import type { RecordingFailure, RecordingOutcome } from '../types'

/**
 * 종료 화면에 보일 녹음 파일 상태.
 * - idle: 파일이 준비됐다
 * - none: 올릴 파일이 없다. 이유는 recordingNotice에 있다
 */
export type CallUploadState = 'idle' | 'none'

/** 파일이 없는 이유. 새로고침 등으로 결과를 받지 못했으면 null. */
export type RecordingNotice = RecordingFailure | 'not-recorded'

export type CallSession = {
  upload: CallUploadState
  recordingNotice: RecordingNotice | null
  /** 통화 중 화면이 끝날 때 녹음 결과를 넘긴다. */
  completeRecording: (callId: number, outcome: RecordingOutcome) => void
  /** 보관 중인 파일을 버린다. */
  discard: () => void
}

/** 통화 중 화면과 종료 화면이 함께 쓰는 녹음 파일 보관소. */
export function useCallSession() {
  return useOutletContext<CallSession>()
}
