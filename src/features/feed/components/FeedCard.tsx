import { Heart, User } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { useToggleHeart } from '../api/useToggleHeart'
import type { FeedListItem } from '../types'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const KST_OFFSET_MS = 9 * HOUR

/** 작성 시각을 "방금 전" / "5분 전" / "3시간 전" / "9/14" / "2025/7/15"로. 시간대 표기가 없으면 한국 시각으로 본다. */
function formatTimeAgo(createdAt: string, now = Date.now()): string {
  const hasOffset = /(Z|[+-]\d{2}:?\d{2})$/.test(createdAt)
  const time = Date.parse(hasOffset ? createdAt : `${createdAt}+09:00`)
  if (Number.isNaN(time)) return ''

  const diff = now - time
  if (diff < MINUTE) return '방금 전'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`

  const date = new Date(time + KST_OFFSET_MS)
  const thisYear = new Date(now + KST_OFFSET_MS).getUTCFullYear()
  const monthDay = `${date.getUTCMonth() + 1}/${date.getUTCDate()}`
  return date.getUTCFullYear() === thisYear ? monthDay : `${date.getUTCFullYear()}/${monthDay}`
}

type Props = {
  feed: FeedListItem
}

/** 피드 글 하나. 작성자 정보가 비어 오면 "익명"으로 보인다. */
export function FeedCard({ feed }: Props) {
  const { mutate: toggleHeart, isPending } = useToggleHeart()
  const hearted = feed.heartYn === 'Y'
  const timeAgo = feed.createdAt ? formatTimeAgo(feed.createdAt) : ''
  const nickname = feed.member?.nickname || '익명'
  const imageUrl = feed.member?.profileImageUrl

  return (
    <article className="border-border flex flex-col gap-3 border-b px-4 py-4">
      <header className="flex items-center gap-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={nickname}
            loading="lazy"
            width={32}
            height={32}
            className="bg-muted size-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
            <User className="size-4" />
          </span>
        )}
        <span className="truncate text-sm font-medium">{nickname}</span>
        {timeAgo && <time className="text-muted-foreground ml-auto text-xs">{timeAgo}</time>}
      </header>

      <p className="bg-muted rounded-xl px-4 py-8 text-center break-words whitespace-pre-wrap">
        {feed.content}
      </p>

      <Button
        variant={hearted ? 'default' : 'outline'}
        size="lg"
        aria-pressed={hearted}
        disabled={isPending}
        onClick={() => toggleHeart(feed.feedId)}
      >
        <Heart className={cn('size-4', hearted && 'fill-current')} />
        관심 보내기
        <span className={cn('tabular-nums', !hearted && 'text-muted-foreground')}>{feed.heart ?? 0}</span>
      </Button>
    </article>
  )
}
