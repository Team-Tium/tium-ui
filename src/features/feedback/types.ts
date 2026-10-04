import type { components } from '@/shared/api/schema'

type Schemas = components['schemas']

/** 최근 통화 목록의 한 항목. 필드는 전부 선택값이다. */
export type RecentCall = Schemas['RecentCall']
/** 피드백 탭 최근 채팅 목록의 한 항목. 필드는 전부 선택값이다. */
export type RecentChat = Schemas['RecentFeedbackChatDTO']
/** 대화 내용 한 문장. `speaker`는 서버가 문자열로 보낸다. */
export type TranscriptSegment = Schemas['Segment']

/** 통화 피드백 결과 화면으로 넘기는 값. 직접 주소로 들어오면 없다. */
export type CallFeedbackRouteState = {
  opponentName?: string
  startedAt?: string
  durationSeconds?: number
}

/** 채팅 피드백 결과 화면으로 넘기는 값. 직접 주소로 들어오면 없다. */
export type ChatFeedbackRouteState = {
  opponentName?: string
}

/** 피드백 탭의 탭 두 개. */
export type FeedbackTab = 'chat' | 'call'
