import { ChevronLeft } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { useCallFeedbackStatus } from '@/shared/api/callFeedback/useCallFeedbackStatus'
import { ListState } from '@/shared/components/ListState'
import { Button } from '@/shared/components/ui/button'
import { errorCode } from '../api/errorCode'
import { useCallFeedback } from '../api/useCallFeedback'
import { CallFeedbackStatusPanel } from '../components/CallFeedbackStatusPanel'
import { CallTranscript } from '../components/CallTranscript'
import { FeedbackResult } from '../components/FeedbackResult'
import { formatCallDate, formatClock } from '../lib/formatTime'
import type { CallFeedbackRouteState } from '../types'

/** 재시도해도 결과가 같은 에러. 통화가 없거나 참여자가 아니다. */
const NO_ACCESS = ['CALL404', 'CALL4031']

/**
 * 통화 피드백 결과 — /feedback/call/:callId
 *
 * 진행 상태를 먼저 보고, 완성이면 결과와 대화 내용을, 아니면 진행 상태와 만들기 버튼을 보인다.
 * 제목 정보는 이동할 때 넘긴 값만 쓴다. 직접 주소로 들어오면 "통화 피드백"이다.
 */
export default function CallFeedbackDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const callId = Number(useParams().callId)
  const routeState = location.state as CallFeedbackRouteState | null
  const validId = Number.isInteger(callId) && callId > 0

  const statusQuery = useCallFeedbackStatus(callId, { enabled: validId })
  const status = statusQuery.data
  const isDone = status?.status === 'DONE'
  const feedbackQuery = useCallFeedback(callId, { enabled: isDone })
  const feedbackMissing = errorCode(feedbackQuery.error) === 'FEEDBACK404'
  const noAccess = NO_ACCESS.includes(errorCode(statusQuery.error) ?? '')

  const opponentName = routeState?.opponentName
  const meta = [
    formatCallDate(routeState?.startedAt),
    typeof routeState?.durationSeconds === 'number' ? formatClock(routeState.durationSeconds) : '',
  ].filter(Boolean)

  // 직접 주소로 들어오면 돌아갈 기록이 없다.
  const goBack = () => (location.key === 'default' ? navigate('/feedback') : navigate(-1))

  return (
    <div className="mx-auto flex max-w-md flex-col">
      <header className="flex items-center gap-1 px-2 py-2">
        <Button variant="ghost" size="icon" aria-label="뒤로" onClick={goBack}>
          <ChevronLeft className="size-5" />
        </Button>
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate text-lg font-semibold">
            {opponentName ? `${opponentName}님과의 통화` : '통화 피드백'}
          </h1>
          {meta.length > 0 && (
            <p className="text-muted-foreground text-xs">{meta.join(' · ')}</p>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4 pb-6">
        {!validId ? (
          <ListState isLoading={false} isError isEmpty={false} errorText="피드백을 찾을 수 없어요.">
            {null}
          </ListState>
        ) : (
          <>
            <ListState
              isLoading={statusQuery.isPending}
              isError={statusQuery.isError}
              isEmpty={false}
              loadingText="피드백 진행 상태를 확인하는 중이에요"
              errorText={
                noAccess ? '이 통화의 피드백을 볼 수 없어요' : '피드백 진행 상태를 확인하지 못했어요'
              }
            >
              {status && !isDone && <CallFeedbackStatusPanel callId={callId} status={status} />}
              {isDone && (
                <ListState
                  isLoading={feedbackQuery.isPending}
                  isError={feedbackQuery.isError && !feedbackMissing}
                  isEmpty={feedbackMissing}
                  loadingText="피드백을 불러오는 중이에요"
                  errorText="피드백을 불러오지 못했어요"
                  emptyText="피드백 결과가 없어요"
                >
                  {feedbackQuery.data && <FeedbackResult feedback={feedbackQuery.data} />}
                </ListState>
              )}
              {isDone && <CallTranscript callId={callId} opponentName={opponentName} />}
            </ListState>

            {statusQuery.isError && !noAccess && (
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
          </>
        )}
      </div>
    </div>
  )
}
