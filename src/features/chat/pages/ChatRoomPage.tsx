import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { useChatMessages } from "../api/useChatMessages"
import { useSendMessage } from "../api/useSendMessage"
import { useReadReceipt } from "../api/useReadReceipt"
import { useLeaveRoom } from "../api/useLeaveRoom"
import { useChatRoomSocket } from "../api/useChatRoomSocket"
import { useChatRoomRecovery } from "../api/useChatRoomRecovery"
import { useChatRecommendations } from "../api/useChatRecommendations"
import { ChatRoomHeader } from "../components/ChatRoomHeader"
import { ChatMessageBubble } from "../components/ChatMessageBubble"
import { ChatInputBar } from "../components/ChatInputBar"
import { ChatRoomMenuModal } from "../components/ChatRoomMenuModal"
import { CallStartModal } from "../../../shared/components/CallStartModal"
import { ListState } from "@/shared/components/ListState"
import { useInfiniteScrollTrigger } from "@/shared/hooks/useInfiniteScrollTrigger"

/**
 * 1:1 채팅방 — /chat/:roomId · docs/ia.md 3절 (Chat page 2)
 *
 * REST + 소켓(useChatRoomSocket) + 재연결 복구(useChatRoomRecovery, §8) 다 붙었다.
 * 목록 화면 쪽 소켓 연동은 별도 이슈.
 *
 * 할 말 추천 상태를 ChatInputBar가 아니라 여기서 든다: 소켓 MESSAGE_CREATED가
 * 오면 낡은 추천을 리셋해야 하는데, 그 리셋은 소켓 콜백과 같은 레벨에서만 가능하다.
 *
 * 피드백 버튼: GET/POST /chats/{roomId}/feedback은 배포됐지만 chat_api.md에
 * 명세가 없어 직접 호출하지 않고 FeedbackDetailPage(/feedback/:id)로만 이동시킨다.
 * TODO: :id가 roomId인지 확정 필요.
 */
export default function ChatRoomPage() {
  const navigate = useNavigate()
  const { roomId: roomIdParam } = useParams<{ roomId: string }>()
  const roomId = Number(roomIdParam)

  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useChatMessages(roomId)
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(roomId)
  const { mutate: markRead } = useReadReceipt(roomId)
  const { mutate: leaveRoom, isPending: isLeaving } = useLeaveRoom(roomId)
  useChatRoomRecovery(roomId)

  const [showRecommendations, setShowRecommendations] = useState(false)
  const {
    mutate: getRecommendations,
    data: recommendationsData,
    isPending: isRecommending,
    reset: resetRecommendations,
  } = useChatRecommendations(roomId)

  // 새 메시지가 실시간으로 오면, 열려 있던 추천 문구가 그 시점 기준으로 낡으므로 리셋한다.
  // 다시 보고 싶으면 새싹 버튼을 또 눌러 최신 맥락으로 재요청하게 된다.
  useChatRoomSocket(roomId, () => {
    resetRecommendations()
    setShowRecommendations(false)
  })

  const handleToggleRecommendations = () => {
    const next = !showRecommendations
    setShowRecommendations(next)
    // 대화가 계속 진행되므로 캐시된 추천을 재사용하지 않고, 열 때마다 최신 맥락 기준으로 새로 요청한다
    if (next) getRecommendations()
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasScrolledOnce = useRef(false)

  const topSentinelRef = useInfiniteScrollTrigger(
    () => fetchNextPage(),
    hasNextPage === true && !isFetchingNextPage,
  )

  // 최초 로딩 시 한 번만 맨 아래(최신 메시지)로 스크롤
  useEffect(() => {
    if (data && !hasScrolledOnce.current) {
      bottomRef.current?.scrollIntoView({ block: "end" })
      hasScrolledOnce.current = true
    }
  }, [data])

  // 방을 보고 있는 동안 읽음 처리. data.messages가 바뀔 때마다(REST 최초 로딩,
  // 소켓 MESSAGE_CREATED, 재연결 복구로 채워진 메시지 모두 포함) 자동으로 다시 불린다.
  useEffect(() => {
    const latestId = data?.messages.at(-1)?.id
    if (latestId) markRead(latestId)
  }, [data?.messages, markRead])

  return (
    <div className="mx-auto flex h-svh max-w-md flex-col">
      <ChatRoomHeader
        nickname={data?.opponent.nickname ?? "채팅방"}
        avatarUrl={data?.opponent.profileImageUrl ?? ""}
        onMenuClick={() => setIsMenuOpen(true)}
        onCallClick={() => setIsCallModalOpen(true)}
        onFeedbackClick={() => navigate(`/feedback/${roomId}`)}
      />

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-button]:hidden">
        <ListState
          isLoading={isPending}
          isError={isError}
          isEmpty={!isPending && !isError && (data?.messages.length ?? 0) === 0}
          emptyText="아직 메시지가 없어요. 먼저 인사해보세요!"
        >
          <div ref={topSentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="py-2 text-center text-xs text-muted-foreground">불러오는 중...</div>
          )}
          {data?.messages.map((message, index) => {
            // 연속된 상대 메시지 묶음의 첫 번째에만 프로필을 보여준다 (카톡 방식)
            const prevMessage = data.messages[index - 1]
            const showAvatar = !message.mine && (!prevMessage || prevMessage.mine)
            return (
              <ChatMessageBubble
                key={message.id}
                message={message}
                avatarUrl={data.opponent.profileImageUrl}
                showAvatar={showAvatar}
              />
            )
          })}
          <div ref={bottomRef} />
        </ListState>
      </div>

      <ChatInputBar
        disabled={data?.opponentLeft ?? true}
        isSending={isSending}
        onSend={(content) => sendMessage({ type: "TEXT", content })}
        showRecommendations={showRecommendations}
        recommendations={recommendationsData?.suggestions}
        isRecommending={isRecommending}
        onToggleRecommendations={handleToggleRecommendations}
      />

      <ChatRoomMenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onLeave={() => leaveRoom()}
        opponentId={data?.opponent.userId ?? 0}
        opponentNickname={data?.opponent.nickname ?? ""}
        opponentAvatarUrl={data?.opponent.profileImageUrl ?? ""}
        isLeaving={isLeaving}
      />

      <CallStartModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        roomId={roomId}
      />
    </div>
  )
}