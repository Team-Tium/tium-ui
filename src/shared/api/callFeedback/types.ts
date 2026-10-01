import type { components } from '@/shared/api/schema'

type Schemas = components['schemas']

/** 녹음 업로드 응답. 필드는 전부 선택값이다. */
export type CallSttUploadResponse = Schemas['SaveResult']
/** 분석된 대화 내용. */
export type CallSttResponse = Schemas['SegmentList']
/** 통화 피드백 본문. 채팅 피드백과 같은 모양이다. */
export type CallFeedbackResponse = Schemas['FeedbackResponseDTOv1']
/** 피드백 진행 상태. */
export type CallFeedbackStatusResponse = Schemas['Status']
/** 피드백 탭의 최근 통화 목록. */
export type RecentCallsResponse = Schemas['RecentCallList']

/** 통화 피드백 진행 상태 값. */
export type CallFeedbackStatus = NonNullable<CallFeedbackStatusResponse['status']>
