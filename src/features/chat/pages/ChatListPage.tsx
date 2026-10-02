import { useChatRoomList } from "../api/useChatRoomList"
import { useChatListSocket } from "../api/useChatListSocket"
import { ChatListItem } from "../components/ChatListItem"
import { ListState } from "@/shared/components/ListState"
import { useInfiniteScrollTrigger } from "@/shared/hooks/useInfiniteScrollTrigger"

/**
 * 최근 채팅 목록 — / · docs/ia.md 3절 (Chat page 1)
 * useChatListSocket은 반환값 없이 호출만 한다 — 이 화면이 떠 있는 동안
 * 실시간 이벤트를 듣고 캐시를 직접 갱신하는 용도이기 때문이다.
 */
export default function ChatListPage() {
  const { data: chats, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChatRoomList()
  useChatListSocket()

  const sentinelRef = useInfiniteScrollTrigger(
    () => fetchNextPage(),
    hasNextPage === true && !isFetchingNextPage,
  )

  return (
    <div>
      <h1 className="px-4 py-3 text-lg font-semibold">최근 채팅</h1>

      <ListState
        isLoading={isPending}
        isError={isError}
        isEmpty={!isPending && !isError && (chats?.length ?? 0) === 0}
        emptyText="채팅 내역이 없어요."
      >
        <div className="divide-y">
          {chats?.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} />
          ))}
        </div>

        <div ref={sentinelRef} className="h-1" />

        {isFetchingNextPage && (
          <div className="py-4 text-center text-sm text-muted-foreground">불러오는 중...</div>
        )}
      </ListState>
    </div>
  )
}