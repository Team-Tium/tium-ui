import { Heart, Trash2 } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { formatTimeAgo } from '@/shared/lib/formatTimeAgo'
import type { FeedListItem } from '../types'

type Props = {
  feed: FeedListItem
  onOpenHearts: (feedId: number) => void
  onDelete: (feedId: number) => void
}

/** 내 글 하나. 하트 수, 삭제 버튼, "친구 확인" 버튼이 있다. */
export function MyPostCard({ feed, onOpenHearts, onDelete }: Props) {
  const timeAgo = feed.createdAt ? formatTimeAgo(feed.createdAt) : ''

  return (
    <article className="border-border flex flex-col gap-3 border-b px-4 py-4">
      <p className="bg-muted rounded-xl px-4 py-8 text-center break-words whitespace-pre-wrap">
        {feed.content}
      </p>

      <div className="flex items-center gap-3">
        <span className="text-muted-foreground flex items-center gap-1 text-sm">
          <Heart className="size-4" />
          <span className="sr-only">하트</span>
          <span className="tabular-nums">{feed.heart ?? 0}</span>
        </span>
        {timeAgo && <time className="text-muted-foreground text-xs">{timeAgo}</time>}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="삭제"
          className="text-muted-foreground ml-auto"
          onClick={() => onDelete(feed.feedId)}
        >
          <Trash2 className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full px-3"
          onClick={() => onOpenHearts(feed.feedId)}
        >
          친구 확인
        </Button>
      </div>
    </article>
  )
}
