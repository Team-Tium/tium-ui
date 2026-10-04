import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { api } from "@/shared/api/client"
import type { ChatMessageDto, ChatRoomMessagesResponse, SendMessageResult } from "../types"
import { chatMessagesQueryKey } from "./useChatMessages"

export interface SendMessageRequest {
  type: "TEXT"
  content: string
}

/**
 * 메시지 보내기 — `POST /chats/{roomId}/messages` · docs/chat_api.md §4
 *
 * 소켓 MESSAGE_CREATED가 뒤이어 와도 중복 안 되도록 messageId 기준으로
 * useChatRoomSocket과 같은 캐시 모양을 쓴다.
 * 목록 갱신은 ROOM_UPDATED(useChatListSocket)가 하므로 여기선 안 한다(중복 제거).
 */
export function useSendMessage(roomId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: SendMessageRequest) =>
      api.post<SendMessageResult>(`/chats/${roomId}/messages`, body),
    onSuccess: (sent) => {
      const message: ChatMessageDto = { ...sent, isRead: false }

      queryClient.setQueryData<InfiniteData<ChatRoomMessagesResponse, number | undefined>>(
        chatMessagesQueryKey(roomId),
        (old) => {
          if (!old) return old
          const [first, ...rest] = old.pages
          if (first.messages.some((m) => m.messageId === message.messageId)) return old
          return {
            ...old,
            pages: [{ ...first, messages: [message, ...first.messages] }, ...rest],
          }
        },
      )
    },
  })
}