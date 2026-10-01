import { ChevronRight, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { callFeedbackHref } from '@/shared/api/callFeedback/paths'
import { getCallFeedbackStatusText } from '@/shared/lib/callFeedbackStatusText'
import { cn } from '@/shared/lib/utils'
import { formatCallDate, formatClock } from '../lib/formatTime'
import type { CallFeedbackRouteState, RecentCall } from '../types'

type Props = {
  call: RecentCall & { callId: number }
}

/** 최근 통화 한 줄. 진행 상태는 목록 응답 값을 그대로 쓴다. */
export function RecentCallItem({ call }: Props) {
  const navigate = useNavigate()
  const name = call.opponent?.nickname ?? '상대방'
  const imageUrl = call.opponent?.profileImageUrl
  const { text } = getCallFeedbackStatusText({ status: call.status })
  const meta = [
    formatCallDate(call.startedAt),
    typeof call.durationSeconds === 'number' ? formatClock(call.durationSeconds) : '',
  ].filter(Boolean)

  const open = () => {
    const state: CallFeedbackRouteState = {
      opponentName: call.opponent?.nickname,
      startedAt: call.startedAt,
      durationSeconds: call.durationSeconds,
    }
    navigate(callFeedbackHref(call.callId), { state })
  }

  return (
    <button
      type="button"
      onClick={open}
      className="active:bg-muted/50 flex w-full items-center gap-3 px-4 py-3 text-left"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          width={48}
          height={48}
          className="bg-muted size-12 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-full">
          <User className="size-6" />
        </span>
      )}

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-medium">{name}</span>
        {meta.length > 0 && (
          <span className="text-muted-foreground truncate text-xs">{meta.join(' · ')}</span>
        )}
        <span
          className={cn(
            'truncate text-sm',
            call.status === 'DONE' && 'text-primary',
            call.status === 'FAILED' && 'text-destructive',
            call.status !== 'DONE' && call.status !== 'FAILED' && 'text-muted-foreground',
          )}
        >
          {text}
        </span>
      </span>

      <ChevronRight className="text-muted-foreground size-4 shrink-0" />
    </button>
  )
}
