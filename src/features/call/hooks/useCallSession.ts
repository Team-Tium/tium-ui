import { useOutletContext } from 'react-router-dom'

import type { RecordingFailure, RecordingOutcome } from '../types'

/**
 * 종료 화면에 보일 녹음 업로드 상태.
 * - uploading: 올리는 중
 * - done: 서버가 받았다
 * - failed: 올리지 못했다. 파일이 남아 있어 다시 올릴 수 있다
 * - none: 올릴 파일이 없다. 이유는 recordingNotice에 있다
 */
export type CallUploadState = 'uploading' | 'done' | 'failed' | 'none'

/**
 * 파일이 없는 이유. 새로고침 등으로 결과를 받지 못했으면 null.
 * - already-used: 이미 피드백 생성에 쓰인 녹음이라 서버가 바꾸지 않는다
 */
export type RecordingNotice = RecordingFailure | 'not-recorded' | 'already-used'

export type CallSession = {
  upload: CallUploadState
  recordingNotice: RecordingNotice | null
  /** 다시 올릴 수 있는 녹음 파일을 들고 있는지. */
  hasRecording: boolean
  /** 통화 중 화면이 끝날 때 녹음 결과를 넘긴다. 파일이 있으면 바로 올린다. */
  completeRecording: (callId: number, outcome: RecordingOutcome) => void
  /** 들고 있는 파일을 다시 올린다. 올리는 중이면 무시한다. */
  retryUpload: () => void
  /** 보관 중인 파일을 버린다. */
  discard: () => void
}

/** 통화 중 화면과 종료 화면이 함께 쓰는 녹음 파일 보관소. */
export function useCallSession() {
  return useOutletContext<CallSession>()
}
