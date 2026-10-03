import type { components } from '@/shared/api/schema'

type Schemas = components['schemas']

/** 피드 목록 정렬. 최신순 / 하트순(최근 6시간 안에 쓴 글만). */
export type FeedSort = 'LATEST' | 'HEART'

/** 피드 목록 한 페이지. 첫 페이지 6개, 다음부터 3개씩 온다. 커서는 해석하지 않고 그대로 돌려보낸다. */
export type FeedListPage = Schemas['FeedListDTO']

/** 피드 글 하나. 화면에는 feedId가 있는 글만 쓴다. 나머지 필드는 비어 올 수 있다. */
export type FeedListItem = Schemas['FeedListItemDTO'] & { feedId: number }

export type CreateFeedRequest = Schemas['FeedDTO']
export type FeedResult = Schemas['FeedResultDTO']
export type FeedHeartResult = Schemas['FeedHeartResultDTO']
