import { useCallback, useMemo, useRef, useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'

import type { CallSession, CallUploadState, RecordingNotice } from '../hooks/useCallSession'
import type { RecordingOutcome } from '../types'

type RecordingDraft = {
  callId: number
  blob: Blob
  filename: string
  startedAt: string
}

/**
 * 통화 중 화면과 종료 화면만 감싸는 부모 라우트.
 *
 * 녹음 파일을 두 화면 사이에서만 들고 있다. 전역이나 history에 올리지 않는다.
 * 이 라우트를 벗어나거나 새로고침하면 파일은 사라진다.
 */
export default function CallSessionBoundary() {
  const { callId } = useParams()
  // 다른 통화로 옮겨가면 보관하던 파일을 버리고 새로 시작한다.
  return <CallSessionScope key={callId} />
}

function CallSessionScope() {
  const draftRef = useRef<RecordingDraft | null>(null)
  const [upload, setUpload] = useState<CallUploadState>('none')
  const [recordingNotice, setRecordingNotice] = useState<RecordingNotice | null>(null)

  const completeRecording = useCallback((callId: number, outcome: RecordingOutcome) => {
    if (outcome.kind === 'ready') {
      const { blob, filename, startedAt } = outcome
      draftRef.current = { callId, blob, filename, startedAt }
      setRecordingNotice(null)
      setUpload('idle')
      return
    }
    draftRef.current = null
    setRecordingNotice(outcome.kind === 'failed' ? outcome.reason : 'not-recorded')
    setUpload('none')
  }, [])

  const discard = useCallback(() => {
    draftRef.current = null
    setUpload('none')
  }, [])

  const session = useMemo<CallSession>(
    () => ({ upload, recordingNotice, completeRecording, discard }),
    [upload, recordingNotice, completeRecording, discard],
  )

  return <Outlet context={session} />
}
