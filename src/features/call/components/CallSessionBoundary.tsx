import { useCallback, useMemo, useRef, useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'

import { ApiError } from '@/shared/api/types'
import { useUploadCallRecording, type UploadCallRecordingInput } from '../api/useUploadCallRecording'
import type { CallSession, CallUploadState, RecordingNotice } from '../hooks/useCallSession'
import type { RecordingOutcome } from '../types'

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
  // 업로드에 성공해도 버리지 않는다. 서버 분석이 실패하면 같은 파일을 다시 올린다.
  const draftRef = useRef<UploadCallRecordingInput | null>(null)
  const uploadingRef = useRef(false)
  const [upload, setUpload] = useState<CallUploadState>('none')
  const [hasRecording, setHasRecording] = useState(false)
  const [recordingNotice, setRecordingNotice] = useState<RecordingNotice | null>(null)
  const { mutateAsync: uploadRecording } = useUploadCallRecording()

  const clearDraft = useCallback(() => {
    draftRef.current = null
    setHasRecording(false)
  }, [])

  const startUpload = useCallback(async () => {
    const draft = draftRef.current
    if (!draft || uploadingRef.current) return

    uploadingRef.current = true
    setUpload('uploading')
    try {
      await uploadRecording(draft)
      if (draftRef.current === draft) setUpload('done')
    } catch (error) {
      if (draftRef.current !== draft) return
      if (error instanceof ApiError && error.code === 'CALL_STT4091') {
        clearDraft()
        setRecordingNotice('already-used')
        setUpload('none')
        return
      }
      setUpload('failed')
    } finally {
      uploadingRef.current = false
    }
  }, [uploadRecording, clearDraft])

  const completeRecording = useCallback(
    (callId: number, outcome: RecordingOutcome) => {
      if (outcome.kind === 'ready') {
        const { blob, filename, startedAt } = outcome
        draftRef.current = { callId, blob, filename, startedAt }
        setHasRecording(true)
        setRecordingNotice(null)
        void startUpload()
        return
      }
      clearDraft()
      setRecordingNotice(outcome.kind === 'failed' ? outcome.reason : 'not-recorded')
      setUpload('none')
    },
    [startUpload, clearDraft],
  )

  const retryUpload = useCallback(() => {
    void startUpload()
  }, [startUpload])

  const discard = useCallback(() => {
    clearDraft()
    setUpload('none')
  }, [clearDraft])

  const session = useMemo<CallSession>(
    () => ({ upload, recordingNotice, hasRecording, completeRecording, retryUpload, discard }),
    [upload, recordingNotice, hasRecording, completeRecording, retryUpload, discard],
  )

  return <Outlet context={session} />
}
