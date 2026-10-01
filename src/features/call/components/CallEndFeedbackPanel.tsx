import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { callFeedbackHref } from '@/shared/api/callFeedback/paths'
import { useCallFeedbackStatus } from '@/shared/api/callFeedback/useCallFeedbackStatus'
import { ListState } from '@/shared/components/ListState'
import { Button } from '@/shared/components/ui/button'
import { getCallFeedbackStatusText, NO_SPEECH_REASON } from '@/shared/lib/callFeedbackStatusText'
import { useCallSession, type CallUploadState, type RecordingNotice } from '../hooks/useCallSession'

const NOTICE_TEXT: Record<RecordingNotice, string> = {
  'not-recorded': '연결되기 전에 끝나 녹음하지 않았어요.',
  unsupported: '이 브라우저에서는 녹음할 수 없어 피드백을 만들 수 없어요.',
  recorder: '녹음 중 문제가 생겨 피드백을 만들 수 없어요.',
  'too-large': '녹음이 너무 길어 피드백을 만들 수 없어요.',
  empty: '녹음된 내용이 없어 피드백을 만들 수 없어요.',
  'already-used': '이미 피드백에 쓰인 녹음이라 다시 올리지 않았어요.',
}

const UPLOAD_TEXT: Record<Exclude<CallUploadState, 'none'>, string> = {
  uploading: '통화 녹음을 올리는 중이에요',
  done: '통화 녹음을 올렸어요',
  failed: '통화 녹음을 올리지 못했어요',
}

const WAITING_HINT_MS = 60_000

/** active가 ms 넘게 이어졌는지. active가 꺼지면 처음부터 다시 잰다. */
function useLasted(active: boolean, ms: number) {
  const [lasted, setLasted] = useState(false)
  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setLasted(true), ms)
    return () => {
      clearTimeout(timer)
      setLasted(false)
    }
  }, [active, ms])
  return active && lasted
}

type Props = {
  callId: number
  /** 결과 화면 제목에 쓴다. */
  opponentName?: string
}

/** 통화 종료 화면의 녹음 업로드 상태와 피드백 진행 상태. */
export function CallEndFeedbackPanel({ callId, opponentName }: Props) {
  const navigate = useNavigate()
  const { upload, recordingNotice, hasRecording, retryUpload } = useCallSession()

  // 녹음을 못 했으면 서버 상태가 움직이지 않으니 조회하지 않는다.
  // 이유를 모르는 경우(새로고침)는 전에 올렸을 수 있고, 이미 피드백에 쓰인 녹음은 결과가 있어 조회한다.
  const showStatus =
    Number.isFinite(callId) &&
    (upload !== 'none' || recordingNotice === null || recordingNotice === 'already-used')
  const statusQuery = useCallFeedbackStatus(callId, { enabled: showStatus })
  const status = statusQuery.data
  const waitedLong = useLasted(status?.status === 'WAITING_RECORDING', WAITING_HINT_MS)

  // 대화가 인식되지 않은 실패는 같은 파일을 다시 올려도 결과가 같다.
  const myAnalysisFailed =
    status?.status === 'FAILED' &&
    status.mySttSaved === false &&
    status.failedReason !== NO_SPEECH_REASON
  const canRetry = hasRecording && (upload === 'failed' || (upload === 'done' && myAnalysisFailed))

  return (
    <section className="bg-card flex w-full flex-col gap-4 rounded-xl p-4 text-center">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">
          {upload === 'none'
            ? (recordingNotice ? NOTICE_TEXT[recordingNotice] : '이 화면에는 통화 녹음 파일이 없어요.')
            : UPLOAD_TEXT[upload]}
        </p>
        {canRetry && (
          <>
            <p className="text-muted-foreground text-xs">이 화면을 나가면 다시 올릴 수 없어요</p>
            <Button variant="outline" size="sm" className="mt-2 self-center" onClick={retryUpload}>
              다시 올리기
            </Button>
          </>
        )}
      </div>

      {showStatus && (
        <div className="border-border flex flex-col gap-1 border-t pt-4">
          <ListState
            isLoading={statusQuery.isPending}
            isError={statusQuery.isError}
            isEmpty={false}
            loadingText="피드백 진행 상태를 확인하는 중이에요"
            errorText="피드백 진행 상태를 확인하지 못했어요"
          >
            <p className="text-sm">{getCallFeedbackStatusText(status ?? {}).text}</p>
            {waitedLong && (
              <p className="text-muted-foreground text-xs">
                상대방 녹음을 기다리고 있어요. 나중에 피드백 탭에서 확인할 수 있어요
              </p>
            )}
            {/* 다시 올릴 수 있는 동안은 숨긴다. 이 화면을 떠나면 녹음 파일이 사라진다. */}
            {!canRetry && (
              <Button
                size="sm"
                className="mt-2 self-center"
                onClick={() => navigate(callFeedbackHref(callId), { state: { opponentName } })}
              >
                피드백 보러 가기
              </Button>
            )}
          </ListState>
          {statusQuery.isError && (
            <Button
              variant="outline"
              size="sm"
              className="self-center"
              disabled={statusQuery.isFetching}
              onClick={() => void statusQuery.refetch()}
            >
              다시 확인
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
