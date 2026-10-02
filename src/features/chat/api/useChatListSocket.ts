import { useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { useAuth } from "@/app/providers/auth-context"
import { useSubscription } from "@/shared/socket/useSubscription"
import { socketDestination, CHAT_EVENT } from "@/shared/socket/events"
import { chatRoomListQueryKey } from "./useChatRoomList"
import type { ChatRoomDto, ChatRoomListResponse, RoomUpdatedEvent, MemberLeftEvent } from "../types"

/**
 * docs/chat_socket.md §9 — 캐시 원본은 select(Chat[]) 이전의
 * { pages: ChatRoomListResponse[] } 구조라 거기를 직접 수정한다.
 *
 * 재연결 복구는 안 둠 — refetchOnWindowFocus + staleTime 30초로 충분하다고 판단.
 */
export function useChatListSocket() {
  const queryClient = useQueryClient()
  const { memberId } = useAuth()

  useSubscription(memberId ? socketDestination.user(memberId) : null, (event) => {
    switch (event.type) {
      case CHAT_EVENT.roomUpdated: {
        const data = event.data as RoomUpdatedEvent
        queryClient.setQueryData<InfiniteData<ChatRoomListResponse, number | undefined>>(
          chatRoomListQueryKey,
          (old) =>
            old && {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                rooms: page.rooms.map((room: ChatRoomDto) =>
                  room.roomId === data.roomId
                    ? {
                        ...room,
                        // ROOM_UPDATED의 lastMessage는 type이 없어, 기존 값을 베이스로 병합한다
                        lastMessage: { ...room.lastMessage, ...data.lastMessage },
                        unreadCount: data.unreadCount,
                      }
                    : room,
                ),
              })),
            },
        )
        break
      }

      case CHAT_EVENT.memberLeft: {
        const data = event.data as MemberLeftEvent
        queryClient.setQueryData<InfiniteData<ChatRoomListResponse, number | undefined>>(
          chatRoomListQueryKey,
          (old) =>
            old && {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                rooms: page.rooms.map((room: ChatRoomDto) =>
                  room.roomId === data.roomId ? { ...room, opponentLeft: true } : room,
                ),
              })),
            },
        )
        break
      }
    }
  })
}