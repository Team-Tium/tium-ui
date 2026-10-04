import { useInfiniteQuery } from "@tanstack/react-query"
import { api } from "@/shared/api/client"
import { useAuth } from "@/app/providers/auth-context"
import type { ChatRoomMessagesResponse, ChatMessageItem } from "../types"
import { mapChatMessage } from "./mapChatMessage"

/** ['chat','messages',roomId] — docs/architecture.md 4절, docs/chat_socket.md §9의 소켓 캐시 키와 동일해야 함 */
export const chatMessagesQueryKey = (roomId: number) => ["chat", "messages", roomId] as const

export interface ChatRoomView {
  opponent: { userId: number; nickname: string; profileImageUrl: string }
  opponentLeft: boolean
  /** 오래된 메시지 → 최신 메시지 순 (화면 위 → 아래) */
  messages: ChatMessageItem[]
}

/**
 * 채팅방 메시지 조회 — `GET /chats/{roomId}/messages` · docs/chat_api.md §3
 *
 * cursor 기반: 스크롤을 위로 올리면(fetchNextPage) 더 과거 메시지를 가져온다.
 * 서버 응답은 페이지 안에서 최신순(내림차순)이다. 화면에는 시간순(오름차순)으로 그려야
 * 하므로, 페이지 순서와 페이지 내부 순서를 둘 다 뒤집어야 한다 — select 안 로직 참고.
 *
 * `after` 파라미터(재연결 복구용, docs/chat_socket.md §8)는 이 훅이 아니라
 * useChatRoomRecovery가 캐시를 직접 setQueryData로 갱신하는 방식으로 처리한다.
 * cursor 조회(이 훅)와 after 조회(복구)는 캐시에 붙이는 방향이 반대라 queryFn을
 * 공유하기 애매해서 분리했다.
 */
export function useChatMessages(roomId: number) {
  const { memberId } = useAuth()

  return useInfiniteQuery({
    queryKey: chatMessagesQueryKey(roomId),
    queryFn: ({ pageParam }) =>
      api.get<ChatRoomMessagesResponse>(`/chats/${roomId}/messages`, {
        params: {
          size: 30,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor ?? undefined : undefined,
    select: (data): ChatRoomView => {
      const latest = data.pages[0]
      const messages = [...data.pages]
        .reverse()
        .flatMap((page) => [...page.messages].reverse())
        .map((dto) => mapChatMessage(dto, memberId))

      return {
        opponent: {
          userId: latest.opponent.userId,
          nickname: latest.opponent.nickname,
          profileImageUrl: latest.opponent.profileImageUrl ?? "", // TODO: YS 확인 후 정리
        },
        opponentLeft: latest.opponentLeft,
        messages,
      }
    },
  })
}