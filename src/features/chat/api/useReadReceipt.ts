import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/shared/api/client"
import type { ReadReceiptResult } from "../types"
import { chatRoomListQueryKey } from "./useChatRoomList"

/**
 * 읽음 처리 — `PATCH /chats/{roomId}/read-receipts` · docs/chat_api.md §6
 *
 * "방을 보고 있을 때만" 호출하라는 규칙은 ChatRoomPage가 떠 있는 동안만
 * 이 훅이 호출되는 구조로 이미 충족된다.
 *
 * 목록 화면(ChatListPage) 소켓 연동은 별도 이슈로 아직 없어, 대신 여기서 목록을
 * 무효화한다.
 * TODO: 목록 소켓 연동 끝나면 여기 invalidateQueries가 중복인지 확인.
 */
export function useReadReceipt(roomId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lastReadMessageId: number) =>
      api.patch<ReadReceiptResult>(`/chats/${roomId}/read-receipts`, { lastReadMessageId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatRoomListQueryKey })
    },
  })
}