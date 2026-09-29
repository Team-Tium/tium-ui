import { useCallSession, type RecordingNotice } from '../hooks/useCallSession'

const NOTICE_TEXT: Record<RecordingNotice, string> = {
  'not-recorded': '연결되기 전에 끝나 녹음하지 않았어요.',
  unsupported: '이 브라우저에서는 녹음할 수 없어 피드백을 만들 수 없어요.',
  recorder: '녹음 중 문제가 생겨 피드백을 만들 수 없어요.',
  'too-large': '녹음이 너무 길어 피드백을 만들 수 없어요.',
  empty: '녹음된 내용이 없어 피드백을 만들 수 없어요.',
}

/** 통화 종료 화면의 녹음 파일 상태. */
export function CallEndFeedbackPanel() {
  const { upload, recordingNotice } = useCallSession()

  if (upload === 'idle') {
    return (
      <section className="bg-card flex w-full flex-col gap-1 rounded-xl p-4 text-center">
        <p className="text-sm font-medium">통화 녹음을 저장했어요</p>
        <p className="text-muted-foreground text-xs">이 화면을 나가면 다시 올릴 수 없어요</p>
      </section>
    )
  }

  return (
    <section className="bg-card w-full rounded-xl p-4 text-center">
      <p className="text-muted-foreground text-sm">
        {recordingNotice ? NOTICE_TEXT[recordingNotice] : '이 통화의 녹음 파일이 없어요.'}
      </p>
    </section>
  )
}
