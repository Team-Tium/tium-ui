import { useEffect } from "react"
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
 * 끊긴 동안 온 이벤트는 다시 오지 않아, 재연결되면 목록을 다시 불러온다(§8 6번).
 * 소켓 클라이언트가 재연결 성공을 알려주지 않아 useChatRoomRecovery처럼 브라우저 online
 * 이벤트로 대신한다. 네트워크는 살아있는데 소켓만 끊긴 경우는 못 잡는다.
 */
export function useChatListSocket() {
  const queryClient = useQueryClient()
  const { memberId } = useAuth()

  useEffect(() => {
    const refetchList = () => queryClient.invalidateQueries({ queryKey: chatRoomListQueryKey })
    window.addEventListener("online", refetchList)
    return () => window.removeEventListener("online", refetchList)
  }, [queryClient])

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
                        lastMessage: data.lastMessage,
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