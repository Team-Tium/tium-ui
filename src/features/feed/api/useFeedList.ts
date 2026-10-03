import { useInfiniteQuery } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import type { FeedListItem, FeedListPage, FeedSort } from '../types'
import { feedKeys } from './feedKeys'

/** 하트를 누를 수 없는 항목(feedId 없음)은 뺀다. */
function hasFeedId(feed: NonNullable<FeedListPage['feeds']>[number]): feed is FeedListItem {
  return typeof feed.feedId === 'number'
}

/**
 * 피드 목록 — `GET /api/v1/feed`
 *
 * 커서 기반 무한 스크롤. 페이지 크기는 서버가 정한다(첫 페이지 6개, 다음부터 3개).
 * 커서 안에 정렬이 들어 있어서 정렬마다 키를 나눠 처음부터 다시 받는다.
 */
export function useFeedList(sort: FeedSort) {
  return useInfiniteQuery({
    queryKey: feedKeys.list(sort),
    queryFn: ({ pageParam, signal }) =>
      api.get<FeedListPage>('/api/v1/feed', {
        params: { sort, ...(pageParam !== undefined ? { cursor: pageParam } : {}) },
        signal,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasNext && last.nextCursor ? last.nextCursor : undefined),
    // 하트순은 페이지 사이에 하트 수가 바뀌면 같은 글이 다음 페이지에 또 올 수 있다. 처음 받은 것만 남긴다.
    select: (data) => {
      const seen = new Set<number>()
      return data.pages
        .flatMap((page) => (page.feeds ?? []).filter(hasFeedId))
        .filter((feed) => !seen.has(feed.feedId) && seen.add(feed.feedId))
    },
  })
}
