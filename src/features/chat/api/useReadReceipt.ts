import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { api } from "@/shared/api/client"
import { chatRoomListQueryKey } from "./useChatRoomList"
import type { ChatRoomListResponse, ReadReceiptResult } from "../types"

/**
 * 읽음 처리 — `PATCH /chats/{roomId}/read-receipts` · docs/chat_api.md §6
 * 읽음 처리 후에는 ROOM_UPDATED가 오지 않아, 목록의 안 읽은 수는 응답을 받고 직접 0으로 바꾼다.
 */
export function useReadReceipt(roomId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lastReadMessageId: number) =>
      api.patch<ReadReceiptResult>(`/chats/${roomId}/read-receipts`, { lastReadMessageId }),
    onSuccess: () => {
      queryClient.setQueryData<InfiniteData<ChatRoomListResponse, number | undefined>>(
        chatRoomListQueryKey,
        (old) =>
          old && {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              rooms: page.rooms.map((room) =>
                room.roomId === roomId ? { ...room, unreadCount: 0 } : room,
              ),
            })),
          },
      )
    },
  })
}
