import { useNavigate, useParams } from "react-router-dom"
import { useCallback, useEffect, useRef, useState } from "react"
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
import { CallStartModal } from "@/shared/components/CallStartModal"
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
 * 피드백 버튼: /feedback/chat/:roomId로 이동 (통화는 /feedback/call/:callId, ia.md 9/29 분리)
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
  useChatRoomSocket(roomId, () => {
    resetRecommendations()
    setShowRecommendations(false)
  })

  const handleToggleRecommendations = () => {
    const next = !showRecommendations
    setShowRecommendations(next)
    if (next) getRecommendations()
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasScrolledOnce = useRef(false)
  const prevScrollHeightRef = useRef<number | null>(null)
  const isNearBottomRef = useRef(true)
  const lastMarkedIdRef = useRef<number | undefined>(undefined)

  const handleFetchNextPage = useCallback(() => {
    const container = scrollContainerRef.current
    if (container) prevScrollHeightRef.current = container.scrollHeight
    fetchNextPage()
  }, [fetchNextPage])

  const topSentinelRef = useInfiniteScrollTrigger(
    handleFetchNextPage,
    hasNextPage === true && !isFetchingNextPage,
  )

  // 과거 페이지가 위에 붙으면, 늘어난 높이만큼 스크롤 위치를 보정해 화면이 튀지 않게 한다
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || prevScrollHeightRef.current === null) return
    const diff = container.scrollHeight - prevScrollHeightRef.current
    container.scrollTop += diff
    prevScrollHeightRef.current = null
  }, [data])

  // 바닥 근처(150px 이내)에 있는지 추적 — 새 메시지 왔을 때 따라 내려갈지 판단에 쓴다.
  // 150은 "말풍선 한두 줄 정도의 스크롤 여유"로 임의로 잡은 값, 체감 보고 조정 가능.
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 150
    }
    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  // 최초 로딩 시 맨 아래로, 이후에는 바닥 근처에 있을 때만 새 메시지를 따라 내려간다
  useEffect(() => {
    if (!data) return
    if (!hasScrolledOnce.current) {
      bottomRef.current?.scrollIntoView({ block: "end" })
      hasScrolledOnce.current = true
      return
    }
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ block: "end" })
    }
  }, [data])

  // 방을 보고 있는 동안 읽음 처리. 같은 ID로 중복 호출하지 않고, 화면이 보일 때만 보낸다.
  useEffect(() => {
    const latestId = data?.messages.at(-1)?.id
    if (!latestId) return
    if (latestId === lastMarkedIdRef.current) return
    if (document.visibilityState !== "visible") return

    lastMarkedIdRef.current = latestId
    markRead(latestId)
  }, [data?.messages, markRead])

  const isInputDisabled = isPending || isError || (data?.opponentLeft ?? true)

  return (
    <div className="mx-auto flex h-svh max-w-md flex-col">
      <ChatRoomHeader
        nickname={data?.opponent.nickname ?? "채팅방"}
        avatarUrl={data?.opponent.profileImageUrl ?? ""}
        onMenuClick={() => setIsMenuOpen(true)}
        onCallClick={() => setIsCallModalOpen(true)}
        onFeedbackClick={() => navigate(`/feedback/chat/${roomId}`)}
      />

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-button]:hidden"
      >
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
        disabled={isInputDisabled}
        opponentLeft={data?.opponentLeft ?? false}
        isSending={isSending}
        onSend={(content, options) =>
          sendMessage(
            { type: "TEXT", content },
            {
              onSuccess: options?.onSuccess,
              onError: () => {
                options?.onError?.()
                // TODO: alert는 임시 표시. 토스트 등 UI로 교체 검토.
                alert("메시지 전송에 실패했어요. 다시 시도해 주세요.")
              },
            },
          )
        }
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