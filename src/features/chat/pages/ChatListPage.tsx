import { useChatRoomList } from "../api/useChatRoomList"
import { ChatListItem } from "../components/ChatListItem"
import { ListState } from "@/shared/components/ListState"
import { useInfiniteScrollTrigger } from "@/shared/hooks/useInfiniteScrollTrigger"

export default function ChatListPage() {
  const { data: chats, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChatRoomList()

  const sentinelRef = useInfiniteScrollTrigger(
    () => fetchNextPage(),
    hasNextPage === true && !isFetchingNextPage,
  )

  return (
    <div className="mx-auto max-w-md">
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