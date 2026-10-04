import type { FeedSort } from '../types'

/** 피드 쿼리 키. 정렬마다 캐시가 따로 있고, `lists`로 전체 목록과 내 글 목록을 한 번에 무효화한다. */
export const feedKeys = {
  all: ['feed'] as const,
  lists: ['feed', 'list'] as const,
  list: (sort: FeedSort) => ['feed', 'list', sort] as const,
  myList: (sort: FeedSort) => ['feed', 'list', 'mine', sort] as const,
  hearts: ['feed', 'hearts'] as const,
}
