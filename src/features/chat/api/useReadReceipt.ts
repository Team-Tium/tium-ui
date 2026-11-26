import { useEffect, useRef } from "react"
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

/**
 * 방을 보고 있는 동안 가장 최근 메시지까지 읽음 처리한다. docs/chat_socket.md 6절
 * - 같은 ID로 두 번 보내지 않는다.
 * - 탭이 가려져 있으면 보내지 않고, 탭이 다시 보이는 순간 보낸다.
 *   (가려진 동안 온 메시지가 상대 화면에서 계속 안 읽음으로 남지 않게)
 */
export function useMarkLatestRead(roomId: number, latestId: number | undefined) {
  const { mutate: markRead } = useReadReceipt(roomId)
  const lastMarkedIdRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const markLatestRead = () => {
      if (!latestId) return
      if (latestId === lastMarkedIdRef.current) return
      if (document.visibilityState !== "visible") return

      lastMarkedIdRef.current = latestId
      markRead(latestId)
    }

    markLatestRead()
    document.addEventListener("visibilitychange", markLatestRead)
    return () => document.removeEventListener("visibilitychange", markLatestRead)
  }, [latestId, markRead])
}
