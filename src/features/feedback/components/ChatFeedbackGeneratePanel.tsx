import { ApiError } from '@/shared/api/types'
import { Button } from '@/shared/components/ui/button'
import {
  useGenerateChatFeedback,
  useIsGeneratingChatFeedback,
} from '../api/useGenerateChatFeedback'

/** 만들기 실패 안내. 생성 조건이 정해지지 않아 서버가 보낸 문구를 그대로 보인다. */
function generateErrorText(error: unknown): string {
  return error instanceof ApiError && error.code !== 'NETWORK_ERROR'
    ? error.message
    : '피드백을 만들지 못했어요'
}

type Props = {
  roomId: number
}

/** 채팅 피드백이 아직 없을 때 보이는 안내와 "피드백 만들기" 버튼. */
export function ChatFeedbackGeneratePanel({ roomId }: Props) {
  const generate = useGenerateChatFeedback(roomId)
  // 이 화면의 요청뿐 아니라 나갔다 오기 전에 보낸 요청도 센다.
  const isGenerating = useIsGeneratingChatFeedback(roomId)

  return (
    <section className="bg-card flex flex-col items-center gap-3 rounded-xl p-6 text-center">
      <p className="text-sm font-medium">
        {isGenerating ? '피드백을 생성하는 중입니다' : '아직 이 채팅의 피드백이 없어요'}
      </p>
      {isGenerating && (
        <p className="text-muted-foreground text-xs">
          조금 걸릴 수 있어요. 이 화면을 나갔다 와도 계속 만들어져요
        </p>
      )}
      {generate.isError && !isGenerating && (
        <p className="text-destructive text-xs">{generateErrorText(generate.error)}</p>
      )}
      <Button className="mt-1" disabled={isGenerating} onClick={generate.generate}>
        {isGenerating ? '만드는 중...' : '피드백 만들기'}
      </Button>
    </section>
  )
}
