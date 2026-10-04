import { ChevronRight, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { formatTimeAgo } from '@/shared/lib/formatTimeAgo'
import { cn } from '@/shared/lib/utils'
import { chatFeedbackHref } from '../api/chatFeedbackKeys'
import type { ChatFeedbackRouteState, RecentChat } from '../types'

type Props = {
  chat: RecentChat & { roomId: number }
}

/** 최근 채팅 한 줄. 피드백이 있으면 완성, 없으면 만들 수 있다고 보인다. */
export function RecentChatItem({ chat }: Props) {
  const navigate = useNavigate()
  const name = chat.opponent?.nickname ?? '상대방'
  const imageUrl = chat.opponent?.profileImageUrl
  const time = chat.lastMessageAt ? formatTimeAgo(chat.lastMessageAt) : ''

  const open = () => {
    const state: ChatFeedbackRouteState = { opponentName: chat.opponent?.nickname }
    navigate(chatFeedbackHref(chat.roomId), { state })
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
        <span className="flex items-baseline gap-2">
          <span className="truncate font-medium">{name}</span>
          {time && <span className="text-muted-foreground ml-auto shrink-0 text-xs">{time}</span>}
        </span>
        {chat.preview && (
          <span className="text-muted-foreground truncate text-xs">{chat.preview}</span>
        )}
        <span
          className={cn('truncate text-sm', chat.hasFeedback ? 'text-primary' : 'text-muted-foreground')}
        >
          {chat.hasFeedback ? '피드백이 완성되었어요' : '피드백을 만들 수 있어요'}
        </span>
      </span>

      <ChevronRight className="text-muted-foreground size-4 shrink-0" />
    </button>
  )
}
