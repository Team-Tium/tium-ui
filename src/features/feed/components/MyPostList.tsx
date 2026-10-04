import { ListState } from '@/shared/components/ListState'
import { Button } from '@/shared/components/ui/button'
import { useInfiniteScrollTrigger } from '@/shared/hooks/useInfiniteScrollTrigger'
import { useFeedList } from '../api/useFeedList'
import type { FeedSort } from '../types'
import { MyPostCard } from './MyPostCard'

type Props = {
  sort: FeedSort
  onOpenHearts: (feedId: number) => void
}

/** 내 글 목록. 맨 아래에 닿으면 다음 페이지를 불러온다. */
export function MyPostList({ sort, onOpenHearts }: Props) {
  const {
    data: feeds,
    isPending,
    isError,
    isFetchNextPageError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeedList(sort, { mine: true })

  // 다음 페이지가 실패한 뒤에는 자동으로 다시 부르지 않는다. 버튼으로만 다시 시도한다.
  const sentinelRef = useInfiniteScrollTrigger(
    () => void fetchNextPage(),
    hasNextPage === true && !isFetchingNextPage && !isFetchNextPageError,
  )

  return (
    <ListState
      isLoading={isPending}
      // 이미 받은 목록이 있으면 다음 페이지가 실패해도 목록은 그대로 둔다.
      isError={isError && feeds === undefined}
      isEmpty={!isPending && !isError && (feeds?.length ?? 0) === 0}
      errorText="내 글을 불러오지 못했어요."
      emptyText={sort === 'HEART' ? '하트순으로 보여줄 글이 없어요.' : '아직 쓴 글이 없어요.'}
    >
      {feeds?.map((feed) => (
        <MyPostCard key={feed.feedId} feed={feed} onOpenHearts={onOpenHearts} />
      ))}

      <div ref={sentinelRef} className="h-1" />

      {isFetchingNextPage && (
        <div className="text-muted-foreground py-4 text-center text-sm">불러오는 중...</div>
      )}

      {isFetchNextPageError && !isFetchingNextPage && (
        <div className="flex flex-col items-center gap-2 py-4">
          <p className="text-muted-foreground text-sm">글을 더 불러오지 못했어요.</p>
          <Button variant="outline" size="sm" onClick={() => void fetchNextPage()}>
            다시 시도
          </Button>
        </div>
      )}
    </ListState>
  )
}
