import { ListState } from '@/shared/components/ListState'
import { Button } from '@/shared/components/ui/button'
import { useInfiniteScrollTrigger } from '@/shared/hooks/useInfiniteScrollTrigger'
import { useRecentCalls } from '../api/useRecentCalls'
import { RecentCallItem } from './RecentCallItem'

/** 피드백 탭의 통화 탭. 맨 아래에 닿으면 다음 페이지를 불러온다. */
export function RecentCallList() {
  const {
    data: calls,
    isPending,
    isError,
    isFetchNextPageError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRecentCalls()

  // 다음 페이지가 실패한 뒤에는 자동으로 다시 부르지 않는다. 버튼으로만 다시 시도한다.
  const sentinelRef = useInfiniteScrollTrigger(
    () => void fetchNextPage(),
    hasNextPage === true && !isFetchingNextPage && !isFetchNextPageError,
  )

  return (
    <ListState
      isLoading={isPending}
      // 이미 받은 목록이 있으면 다음 페이지가 실패해도 목록은 그대로 둔다.
      isError={isError && calls === undefined}
      isEmpty={!isPending && !isError && (calls?.length ?? 0) === 0}
      errorText="최근 통화를 불러오지 못했어요."
      emptyText="최근 통화가 없어요."
    >
      <div className="divide-border divide-y">
        {calls?.map((call) => (
          <RecentCallItem key={call.callId} call={call} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-1" />

      {isFetchingNextPage && (
        <div className="text-muted-foreground py-4 text-center text-sm">불러오는 중...</div>
      )}

      {isFetchNextPageError && !isFetchingNextPage && (
        <div className="flex flex-col items-center gap-2 py-4">
          <p className="text-muted-foreground text-sm">통화를 더 불러오지 못했어요.</p>
          <Button variant="outline" size="sm" onClick={() => void fetchNextPage()}>
            다시 시도
          </Button>
        </div>
      )}
    </ListState>
  )
}
