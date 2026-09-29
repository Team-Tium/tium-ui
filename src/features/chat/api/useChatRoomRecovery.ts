import { useEffect, useRef } from "react"
import { useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { api } from "@/shared/api/client"
import { chatMessagesQueryKey } from "./useChatMessages"
import type { ChatRoomMessagesResponse } from "../types"

/**
 * 소켓 재연결 복구 — docs/chat_socket.md §8
 *
 * 소켓은 반드시 끊긴다. 끊긴 동안 온 메시지는 재연결 시 캐시의 마지막 메시지 ID
 * 이후를 `after`로 조회해 채운다. 응답의 opponentLeft로 놓친 MEMBER_LEFT도
 * 같이 복구된다 — 별도 API 호출 불필요(§8 5번 단계).
 *
 * 소켓 클라이언트가 "재연결 성공"을 알려주지 않아, 대신 브라우저 online 이벤트로
 * 감지한다. TODO: client.ts가 재연결 콜백을 제공하면 교체 — 지금 방식은 네트워크는
 * 살아있는데 소켓만 끊긴 경우는 못 잡는 한계가 있다.
 */
export function useChatRoomRecovery(roomId: number) {
  const queryClient = useQueryClient()
  const lastMessageIdRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const recover = async () => {
      const cached = queryClient.getQueryData<InfiniteData<ChatRoomMessagesResponse, number | undefined>>(
        chatMessagesQueryKey(roomId),
      )
      const lastPage = cached?.pages[0]
      const after = lastPage?.messages[0]?.messageId
      if (!after) return

      const response = await api.get<ChatRoomMessagesResponse>(`/chats/${roomId}/messages`, {
        params: { after, size: 100 },
      })
      if (response.messages.length === 0 && response.opponentLeft === lastPage?.opponentLeft) return

      queryClient.setQueryData<InfiniteData<ChatRoomMessagesResponse, number | undefined>>(
        chatMessagesQueryKey(roomId),
        (old) => {
          if (!old) return old
          const [first, ...rest] = old.pages
          const existingIds = new Set(first.messages.map((m) => m.messageId))
          // after 응답은 오름차순(오래된 → 최신)이라 우리 캐시(최신이 배열 앞)에 맞춰 뒤집어 붙인다
          const newOnes = response.messages.filter((m) => !existingIds.has(m.messageId)).reverse()
          return {
            ...old,
            pages: [
              { ...first, messages: [...newOnes, ...first.messages], opponentLeft: response.opponentLeft },
              ...rest,
            ],
          }
        },
      )
    }

    window.addEventListener("online", recover)
    return () => window.removeEventListener("online", recover)
  }, [roomId, queryClient])

  // 마지막 메시지 ID 추적은 지금 로직에서 캐시로 직접 조회하므로 실제로는 안 쓰지만,
  // 나중에 client.ts에 재연결 콜백이 생기면 여기서 바로 쓸 수 있게 자리를 남겨둔다.
  return lastMessageIdRef
}