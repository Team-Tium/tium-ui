import { useInfiniteQuery } from "@tanstack/react-query"
import { api } from "@/shared/api/client"
import type { ChatRoomListResponse } from "../types"
import { mapChatRoom } from "./mapChatRoom"
import type { Chat } from "../types"

/** ['chat','rooms'] — docs/architecture.md 4절 쿼리 키 규칙 */
export const chatRoomListQueryKey = ["chat", "rooms"] as const

/**
 * 최근순 채팅 목록 조회 — `GET /chats` · docs/ia.md 3절 (Chat page 1)
 *
 * "최근"은 정렬 기준(최근 대화순)을 의미. 전체 채팅방을 커서 기반 무한 스크롤로 가져온다.
 * docs/architecture.md 5-2
 * TODO: 커서 요청 파라미터 이름 미확정(명세서엔 size 만 문서화돼 있음).
 */
export function useChatRoomList() {
  return useInfiniteQuery({
    queryKey: chatRoomListQueryKey,
    queryFn: ({ pageParam }) =>
      api.get<ChatRoomListResponse>("/chats", {
        params: {
          size: 20,
          ...(pageParam ? { cursor: pageParam } : {}), // TODO: 파라미터 이름 확인 필요
        },
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor ?? undefined : undefined,
    staleTime: 30_000,
    select: (data) =>
      data.pages.flatMap((page) =>
        (page.rooms ?? []).map(mapChatRoom).filter((chat): chat is Chat => chat !== null),
      ),
  })
}