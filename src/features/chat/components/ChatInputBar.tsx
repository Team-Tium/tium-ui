import { type SubmitEvent, useState } from "react"
import { Plus, Image, Paperclip, Send, Sprout } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

interface ChatInputBarProps {
  /** opponentLeft가 true면 입력창 대신 안내 문구만 보인다. docs/chat_api.md §2 */
  disabled: boolean
  isSending: boolean
  onSend: (content: string) => void
  showRecommendations: boolean
  recommendations: string[] | undefined
  isRecommending: boolean
  onToggleRecommendations: () => void
}

/**
 * 추천 요청(useChatRecommendations)과 그 상태는 ChatRoomPage가 들고 있다.
 * 소켓으로 새 메시지가 오면 추천 문구가 낡지 않도록 상태를 리셋해야 하는데,
 * 이 리셋은 useChatRoomSocket과 같은 레벨(ChatRoomPage)에서만 가능해서
 * 이 컴포넌트 로컬 state로 두지 않고 끌어올렸다.
 */
export function ChatInputBar({
  disabled,
  isSending,
  onSend,
  showRecommendations,
  recommendations,
  isRecommending,
  onToggleRecommendations,
}: ChatInputBarProps) {
  const [content, setContent] = useState("")

  // React 19.2.10+ 에서 FormEvent가 deprecated 되어 SubmitEvent로 교체함
  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    onSend(trimmed)
    setContent("")
  }

  if (disabled) {
    return (
      <div className="border-t border-border p-3 text-center text-sm text-muted-foreground">
        상대방이 나간 채팅방이에요. 메시지를 보낼 수 없어요.
      </div>
    )
  }

  return (
    <div className="border-t border-border">
      {/* 상단 줄: 새싹(추천 토글) + 추천 문구 */}
      <div className="flex items-center gap-1.5 px-3 pt-2">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={`rounded-full shrink-0 border-[1.5px] transition-none ${
            showRecommendations
              ? "bg-primary-press border-primary-press text-primary-foreground"
              : "border-primary-press text-primary-press"
          }`}
          onClick={onToggleRecommendations}
          aria-label="할 말 추천"
        >
          <Sprout size={20} />
        </Button>

        {showRecommendations && isRecommending && (
          <span className="self-center text-sm text-muted-foreground">추천 받는 중...</span>
        )}
        {showRecommendations && !isRecommending && recommendations && (
          <div className="flex gap-2 overflow-x-auto pl-1">
            {recommendations.map((text, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setContent(text)}
                className="max-w-[160px] shrink-0 truncate rounded-full border border-sidebar-border bg-muted px-3 py-1.5 text-left text-sm transition-transform active:scale-95 active:bg-sidebar-border"
              >
                {text}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 하단 줄: + / 입력창 / 첨부 / 전송 */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 p-3">
        <Button type="button" size="icon" variant="ghost" className="rounded-full shrink-0" aria-label="더보기">
          <Plus size={20} />
        </Button>

        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="메시지를 입력하세요"
          className="flex-1 rounded-full border border-sidebar-border px-4 py-2 text-sm min-w-0"
        />

        <Button type="button" size="icon" variant="ghost" className="rounded-full shrink-0" aria-label="이미지 첨부">
          <Image size={20} />
        </Button>

        <Button type="button" size="icon" variant="ghost" className="rounded-full shrink-0" aria-label="파일 첨부">
          <Paperclip size={20} />
        </Button>

        <Button
          type="submit"
          size="icon"
          disabled={!content.trim() || isSending}
          className={`rounded-full shrink-0 ${content.trim() ? "bg-primary-press" : ""}`}
          aria-label="전송"
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  )
}