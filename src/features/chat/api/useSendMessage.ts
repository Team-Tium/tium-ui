import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { api } from "@/shared/api/client"
import type { ChatMessageDto, ChatRoomMessagesResponse, SendMessageResult } from "../types"
import { chatMessagesQueryKey } from "./useChatMessages"
import { chatRoomListQueryKey } from "./useChatRoomList"

export interface SendMessageRequest {
  type: "TEXT"
  content: string
}

/**
 * 메시지 보내기 — `POST /chats/{roomId}/messages` · docs/chat_api.md §4
 *
 * 응답(성공 후)을 캐시 맨 앞에 넣는다. 뒤이어 오는 소켓 MESSAGE_CREATED는
 * useChatRoomSocket이 messageId로 중복 판단해 무시하므로 같은 모양으로 짰다.
 *
 * 목록 화면(ChatListPage) 소켓 연동은 별도 이슈로 아직 없어, 대신 여기서 목록을
 * 무효화한다.
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
      queryClient.invalidateQueries({ queryKey: chatRoomListQueryKey })
    },
  })
}