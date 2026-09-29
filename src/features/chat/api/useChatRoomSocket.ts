import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { useSubscription } from '@/shared/socket/useSubscription'
import { socketDestination } from '@/shared/socket/events'
import { CHAT_EVENT } from '@/shared/socket/events'
import { chatMessagesQueryKey } from './useChatMessages'
import type {
  ChatMessageDto,
  ChatRoomMessagesResponse,
  MessageCreatedEvent,
  MessageReadEvent,
} from '../types'

/**
 * 채팅방 화면(ChatRoomPage)이 떠 있는 동안 그 방의 실시간 이벤트를 듣는다.
 * docs/chat_socket.md §4, §9
 *
 * 구독/해제는 useSubscription이 알아서 한다 — 여기서는 이벤트를 캐시에 반영하는 것만 담당.
 *
 * onMessageCreated: 메시지 캐시 반영 외에 화면에서 추가로 해야 할 일이 있을 때 쓴다.
 * 지금은 할 말 추천 문구가 새 메시지 기준으로 낡지 않도록 ChatRoomPage가 여기서
 * 추천 상태를 리셋하는 데 쓰고 있다.
 */
export function useChatRoomSocket(roomId: number, onMessageCreated?: () => void) {
  const queryClient = useQueryClient()

  useSubscription(socketDestination.chatRoom(roomId), (event) => {
    switch (event.type) {
      case CHAT_EVENT.messageCreated: {
        const data = event.data as MessageCreatedEvent
        // docs/chat_socket.md §5 — POST 응답으로 이미 그렸을 수 있으니 messageId로 중복 제거
        queryClient.setQueryData<InfiniteData<ChatRoomMessagesResponse, number | undefined>>(
          chatMessagesQueryKey(roomId),
          (old) => {
            if (!old) return old
            const [first, ...rest] = old.pages
            if (first.messages.some((m) => m.messageId === data.messageId)) return old
            const message: ChatMessageDto = { ...data, isRead: false }
            return { ...old, pages: [{ ...first, messages: [message, ...first.messages] }, ...rest] }
          },
        )
        onMessageCreated?.()
        break
      }

      case CHAT_EVENT.messageRead: {
        const data = event.data as MessageReadEvent
        queryClient.setQueryData<InfiniteData<ChatRoomMessagesResponse, number | undefined>>(
          chatMessagesQueryKey(roomId),
          (old) =>
            old && {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                messages: page.messages.map((m) =>
                  m.messageId <= data.lastReadMessageId ? { ...m, isRead: true } : m,
                ),
              })),
            },
        )
        break
      }

      case CHAT_EVENT.memberLeft: {
        // 이 방 화면: opponentLeft를 true로 → ChatInputBar가 잠긴다.
        // 이 핸들러는 이 방(roomId)만 구독하므로 이벤트 데이터의 roomId 확인이 불필요하다.
        queryClient.setQueryData<InfiniteData<ChatRoomMessagesResponse, number | undefined>>(
          chatMessagesQueryKey(roomId),
          (old) =>
            old && {
              ...old,
              pages: old.pages.map((page, i) =>
                i === 0 ? { ...page, opponentLeft: true } : page,
              ),
            },
        )
        break
      }
    }
  })
}