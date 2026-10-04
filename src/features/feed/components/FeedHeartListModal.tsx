import { Send, User, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ApiError } from '@/shared/api/types'
import { ListState } from '@/shared/components/ListState'
import { Button } from '@/shared/components/ui/button'
import { formatTimeAgo } from '@/shared/lib/formatTimeAgo'
import { useHeartHistory } from '../api/useHeartHistory'
import { useStartChat } from '../api/useStartChat'
import type { FeedHeartHistory } from '../types'

/** 채팅 시작 실패 안내. */
function startChatErrorText(error: unknown): string {
  if (error instanceof ApiError && error.code === 'CHAT4002') return '나에게는 채팅을 보낼 수 없어요.'
  if (error instanceof ApiError && error.code === 'MEMBER4041') return '탈퇴한 사람이에요.'
  return '채팅을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.'
}

/** 이 글에 하트를 누른 기록만 최근 순으로. 같은 사람은 한 번만 보인다. */
function heartsOf(history: FeedHeartHistory[] | undefined, feedId: number) {
  const seen = new Set<number>()
  return (history ?? [])
    .filter((h): h is FeedHeartHistory & { memberId: number } =>
      h.feedId === feedId && typeof h.memberId === 'number',
    )
    .sort((a, b) => (b.heartedAt ?? '').localeCompare(a.heartedAt ?? ''))
    .filter((h) => !seen.has(h.memberId) && seen.add(h.memberId))
}

type Props = {
  feedId: number | null
  onClose: () => void
}

/**
 * 좋아요 누른 친구 확인 팝업. 내 글에 하트를 누른 사람이 익명으로 나온다.
 * 보내기 아이콘을 누르면 그 사람과의 채팅방으로 간다.
 */
export function FeedHeartListModal({ feedId, onClose }: Props) {
  const navigate = useNavigate()
  const isOpen = feedId !== null
  const { data, isPending, isError } = useHeartHistory({ enabled: isOpen })
  const startChat = useStartChat()

  if (!isOpen) return null

  // 다음에 열 때 지난 실패 안내가 남지 않게 지운다.
  const close = () => {
    startChat.reset()
    onClose()
  }

  const hearts = heartsOf(data, feedId)

  const sendTo = (memberId: number) => {
    startChat.mutate(memberId, {
      onSuccess: ({ roomId }) => {
        if (typeof roomId === 'number') navigate(`/chat/${roomId}`)
      },
    })
  }

  return (
    <div
      className="bg-muted-foreground/60 fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feed-heart-list-title"
        className="bg-background flex max-h-[70vh] w-5/6 max-w-sm flex-col overflow-hidden rounded-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <h2 id="feed-heart-list-title" className="text-md font-medium">
            좋아요 누른 친구 확인
          </h2>
          <Button variant="ghost" size="icon-sm" aria-label="닫기" onClick={close}>
            <X className="text-muted-foreground" />
          </Button>
        </div>

        <div className="overflow-y-auto">
          <ListState
            isLoading={isPending}
            isError={isError}
            isEmpty={hearts.length === 0}
            errorText="좋아요 기록을 불러오지 못했어요."
            emptyText="아직 좋아요를 누른 친구가 없어요."
          >
            <ul className="divide-border divide-y">
              {hearts.map((heart) => (
                <li key={heart.memberId} className="flex items-center gap-3 px-4 py-3">
                  <span className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
                    <User className="size-5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium">익명의 친구</span>
                    {heart.heartedAt && (
                      <span className="text-muted-foreground text-xs">
                        {formatTimeAgo(heart.heartedAt)}
                      </span>
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="채팅 보내기"
                    disabled={startChat.isPending}
                    onClick={() => sendTo(heart.memberId)}
                  >
                    <Send className="size-5" />
                  </Button>
                </li>
              ))}
            </ul>
          </ListState>
        </div>

        {startChat.isError && (
          <p role="alert" className="text-destructive px-4 py-3 text-center text-xs">
            {startChatErrorText(startChat.error)}
          </p>
        )}
      </div>
    </div>
  )
}
