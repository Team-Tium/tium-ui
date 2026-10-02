import { useMutation } from "@tanstack/react-query"
import { api } from "@/shared/api/client"
import type { ReadReceiptResult } from "../types"

/**
 * 읽음 처리 — `PATCH /chats/{roomId}/read-receipts` · docs/chat_api.md §6
 * 목록 갱신은 ROOM_UPDATED(useChatListSocket)가 하므로 여기선 안 한다(중복 제거).
 */
export function useReadReceipt(roomId: number) {
  return useMutation({
    mutationFn: (lastReadMessageId: number) =>
      api.patch<ReadReceiptResult>(`/chats/${roomId}/read-receipts`, { lastReadMessageId }),
  })
}