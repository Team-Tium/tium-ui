import { useMutation } from "@tanstack/react-query"
import { api } from "@/shared/api/client"

export type ReportTargetType = "MEMBER" | "CHAT_MESSAGE"
export type ReportReason = "SPAM" | "ABUSE" | "SEXUAL" | "FRAUD" | "ETC"

export interface ReportRequest {
  targetType: ReportTargetType
  targetId: number
  chatRoomId?: number
  reason: ReportReason
  description?: string
}

export interface ReportResult {
  reportId: number
  status: "RECEIVED"
}

/**
 * 신고하기 — `POST /reports` · docs/chat_api.md §8
 * TODO: schema.d.ts에 아직 없음(배포 전). 배포되면 생성 타입으로 교체.
 *
 * 지금은 ChatRoomMenuModal에서 직접 쓰지 않는다 — 신고는 팝업이 아니라
 * /report/:targetId 페이지로 이동하는 방식으로 바뀌었고, 이 훅은
 * 그 ReportPage.tsx(별도 작업)에서 쓰일 예정이라 남겨둔다.
 *
 * 채팅 전용이 아니라 범용이라, 다른 도메인도 쓰게 되면 shared로 올린다. docs/architecture.md 2절 규칙 2
 */
export function useReportTarget() {
  return useMutation({
    mutationFn: (body: ReportRequest) => api.post<ReportResult>("/reports", body),
  })
}