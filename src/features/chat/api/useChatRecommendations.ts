import { useMutation } from "@tanstack/react-query"
import { api } from "@/shared/api/client"
import type { SuggestRepliesResult } from "../types"

/**
 * 할 말 추천 — `POST /chats/{roomId}/recommendations` · docs/chat_api.md §7
 *
 * 엔드포인트 경로는 그대로다. 다만 응답 안의 배열 필드명이 `suggestions`다
 * (SuggestRepliesDTO 기준) — docs/chat_api.md 초안은 이 필드를 recommendations로
 * 적어놨었지만 실제 배포본과 다르다.
 * 결과는 저장하지 않는다(테이블 없음). 매번 새로 요청한다.
 * TODO: 컨텍스트 메시지 개수, 대화 시작 직후 동작 미정 (docs/chat_api.md "남은 결정 사항" 3번)
 */
export function useChatRecommendations(roomId: number) {
  return useMutation({
    mutationFn: () => api.post<SuggestRepliesResult>(`/chats/${roomId}/recommendations`),
  })
}