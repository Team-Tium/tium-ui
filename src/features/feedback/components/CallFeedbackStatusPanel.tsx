import type { CallFeedbackStatusResponse } from '@/shared/api/callFeedback/types'
import { Button } from '@/shared/components/ui/button'
import { getCallFeedbackStatusText } from '@/shared/lib/callFeedbackStatusText'
import { errorCode } from '../api/errorCode'
import {
  useGenerateCallFeedback,
  useIsGeneratingCallFeedback,
} from '../api/useGenerateCallFeedback'

/** 만들기 실패 안내. 진행 상태로 설명되는 409는 따로 말하지 않는다. */
function generateErrorText(error: unknown): string | null {
  switch (errorCode(error)) {
    case 'COMMON409':
      return null
    case 'CALL_STT4001':
    case 'CALL_STT4041':
      return '아직 대화 내용 분석이 끝나지 않았어요'
    default:
      return '피드백을 만들지 못했어요'
  }
}

type Props = {
  callId: number
  status: CallFeedbackStatusResponse
}

/** 결과 화면의 진행 상태와 "피드백 만들기" 버튼. 완성 전까지만 보인다. */
export function CallFeedbackStatusPanel({ callId, status }: Props) {
  const generate = useGenerateCallFeedback(callId)
  // 이 화면의 요청뿐 아니라 나갔다 오기 전에 보낸 요청도 센다.
  const isGenerating = useIsGeneratingCallFeedback(callId)

  // 요청을 보낸 직후 서버가 아직 READY를 돌려줄 수 있다. 응답 전까지는 생성 중으로 보인다.
  const { text, canGenerate } = isGenerating
    ? getCallFeedbackStatusText({ status: 'GENERATING' })
    : getCallFeedbackStatusText(status)
  // 요청은 실패했어도 서버가 계속 만들고 있으면 실패라고 말하지 않는다.
  const errorText =
    generate.isError && status.status !== 'GENERATING' ? generateErrorText(generate.error) : null

  return (
    <section className="bg-card flex flex-col items-center gap-3 rounded-xl p-6 text-center">
      <p className="text-sm font-medium">{text}</p>
      {status.status === 'GENERATING' || isGenerating ? (
        <p className="text-muted-foreground text-xs">
          조금 걸릴 수 있어요. 이 화면을 나갔다 와도 계속 만들어져요
        </p>
      ) : null}
      {errorText && <p className="text-destructive text-xs">{errorText}</p>}
      {(canGenerate || isGenerating) && (
        <Button
          className="mt-1"
          disabled={isGenerating}
          onClick={generate.generate}
        >
          {isGenerating ? '만드는 중...' : '피드백 만들기'}
        </Button>
      )}
    </section>
  )
}
