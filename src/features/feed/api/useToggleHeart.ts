import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import type { FeedHeartResult, FeedListPage } from '../types'
import { feedKeys } from './feedKeys'

/**
 * 하트 누르기·취소 — `POST /api/v1/feed/heart`
 *
 * 같은 요청이 누를 때마다 켜고 끈다. 응답의 하트 수와 내 상태를 목록 캐시에 바로 넣는다.
 * 목록을 다시 받으면 하트순에서 카드 순서가 바뀌어 보던 자리를 잃으므로 목록은 무효화하지 않는다.
 */
export function useToggleHeart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (feedId: number) => api.post<FeedHeartResult>('/api/v1/feed/heart', { feedId }),
    onSuccess: async (result, feedId) => {
      // 진행 중이던 목록 요청이 늦게 도착해 이 결과를 덮어쓰지 않게 먼저 멈춘다.
      await queryClient.cancelQueries({ queryKey: feedKeys.lists })

      queryClient.setQueriesData<InfiniteData<FeedListPage>>({ queryKey: feedKeys.lists }, (old) =>
        old
          ? {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                feeds: page.feeds?.map((feed) =>
                  feed.feedId === feedId
                    ? {
                        ...feed,
                        heart: result.heart ?? feed.heart,
                        heartYn: result.heartYn ?? feed.heartYn,
                      }
                    : feed,
                ),
              })),
            }
          : old,
      )

      // 목록 말고 하트 수를 보여주는 다른 피드 캐시는 새로 받는다.
      return queryClient.invalidateQueries({
        queryKey: feedKeys.all,
        predicate: ({ queryKey }) => queryKey[1] !== 'list',
      })
    },
  })
}
