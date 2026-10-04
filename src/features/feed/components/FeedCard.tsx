import { Heart, User } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { formatTimeAgo } from '@/shared/lib/formatTimeAgo'
import { cn } from '@/shared/lib/utils'
import { useToggleHeart } from '../api/useToggleHeart'
import type { FeedListItem } from '../types'

type Props = {
  feed: FeedListItem
}

/** 피드 글 하나. 작성자 정보가 비어 오면 "익명"으로 보인다. */
export function FeedCard({ feed }: Props) {
  const { mutate: toggleHeart, isPending, isError } = useToggleHeart()
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
      {isError && (
        <p role="alert" className="text-destructive text-center text-xs">
          관심을 보내지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}
    </article>
  )
}
