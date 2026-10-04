import { ChevronLeft } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ListState } from '@/shared/components/ListState'
import { Button } from '@/shared/components/ui/button'
import { errorCode } from '../api/errorCode'
import { useChatFeedback } from '../api/useChatFeedback'
import { useIsGeneratingChatFeedback } from '../api/useGenerateChatFeedback'
import { ChatFeedbackGeneratePanel } from '../components/ChatFeedbackGeneratePanel'
import { FeedbackResult } from '../components/FeedbackResult'
import type { ChatFeedbackRouteState } from '../types'

/** 재시도해도 결과가 같은 에러. 채팅방이 없거나 참여자가 아니다. */
const NO_ACCESS = ['CHAT4041', 'CHAT4031']

/**
 * 채팅 피드백 결과 — /feedback/chat/:roomId
 *
 * 결과가 있으면 보이고, 없으면 만들기 버튼을 보인다. 진행 상태 API는 없다.
 * 제목은 이동할 때 넘긴 상대 이름만 쓴다. 직접 주소로 들어오면 "채팅 피드백"이다.
 */
export default function ChatFeedbackDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const roomId = Number(useParams().roomId)
  const routeState = location.state as ChatFeedbackRouteState | null
  const validId = Number.isInteger(roomId) && roomId > 0

  const feedbackQuery = useChatFeedback(roomId, { enabled: validId })
  const isGenerating = useIsGeneratingChatFeedback(roomId)
  const code = errorCode(feedbackQuery.error)
  const noAccess = NO_ACCESS.includes(code ?? '')
  const feedback = feedbackQuery.data
  // 결과가 없으면 에러로 오지만, 빈 결과로 올 수도 있어 둘 다 "아직 없음"으로 본다.
  const missing = code === 'FEEDBACK404' || (feedbackQuery.isSuccess && !feedback)
  const failed = feedbackQuery.isError && !missing

  const opponentName = routeState?.opponentName

  // 직접 주소로 들어오면 돌아갈 기록이 없다.
  const goBack = () =>
    location.key === 'default' ? navigate('/feedback?tab=chat') : navigate(-1)

  return (
    <div className="mx-auto flex max-w-md flex-col">
      <header className="flex items-center gap-1 px-2 py-2">
        <Button variant="ghost" size="icon" aria-label="뒤로" onClick={goBack}>
          <ChevronLeft className="size-5" />
        </Button>
        <h1 className="truncate text-lg font-semibold">
          {opponentName ? `${opponentName}님과의 채팅` : '채팅 피드백'}
        </h1>
      </header>

      <div className="flex flex-col gap-3 px-4 pb-6">
        {!validId ? (
          <ListState isLoading={false} isError isEmpty={false} errorText="피드백을 찾을 수 없어요.">
            {null}
          </ListState>
        ) : (
          <>
            <ListState
              // 만드는 중에 화면에 들어오면 결과 조회보다 만드는 중 안내를 먼저 보인다.
              isLoading={feedbackQuery.isPending && !isGenerating}
              isError={failed && !isGenerating}
              isEmpty={false}
              loadingText="피드백을 불러오는 중이에요"
              errorText={
                noAccess ? '이 채팅의 피드백을 볼 수 없어요' : '피드백을 불러오지 못했어요'
              }
            >
              {feedback ? (
                <FeedbackResult feedback={feedback} />
              ) : (
                <ChatFeedbackGeneratePanel roomId={roomId} />
              )}
            </ListState>

            {failed && !noAccess && !isGenerating && (
              <Button
                variant="outline"
                size="sm"
                className="self-center"
                disabled={feedbackQuery.isFetching}
                onClick={() => void feedbackQuery.refetch()}
              >
                다시 확인
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
