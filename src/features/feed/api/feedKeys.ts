import type { FeedSort } from '../types'

/** 피드 쿼리 키. 정렬마다 캐시가 따로 있고, `lists`로 둘 다 한 번에 무효화한다. */
export const feedKeys = {
  all: ['feed'] as const,
  lists: ['feed', 'list'] as const,
  list: (sort: FeedSort) => ['feed', 'list', sort] as const,
}
