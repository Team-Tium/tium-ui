import { Image, Paperclip, Plus, Send, Sprout } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/shared/components/ui/button"

const messageSchema = z.object({
  content: z.string().trim().min(1),
})
type MessageFormValues = z.infer<typeof messageSchema>

interface SendOptions {
  onSuccess?: () => void
  onError?: () => void
}

interface ChatInputBarProps {
  /** 로딩·에러·opponentLeft 등 입력창 자체를 잠가야 할 때 true */
  disabled: boolean
  /** disabled가 true일 때, 안내 문구를 "상대방이 나갔다"로 보여줄지 여부 */
  opponentLeft: boolean
  isSending: boolean
  onSend: (content: string, options?: SendOptions) => void
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
  opponentLeft,
  isSending,
  onSend,
  showRecommendations,
  recommendations,
  isRecommending,
  onToggleRecommendations,
}: ChatInputBarProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isValid },
  } = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    mode: "onChange",
    defaultValues: { content: "" },
  })

  const onSubmit = (values: MessageFormValues) => {
    onSend(values.content, { onSuccess: () => reset() })
  }

  if (disabled) {
    return (
      <div className="border-t border-border p-3 text-center text-sm text-muted-foreground">
        {opponentLeft ? "상대방이 나간 채팅방이에요. 메시지를 보낼 수 없어요." : "불러오는 중..."}
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
                onClick={() => setValue("content", text, { shouldValidate: true })}
                className="max-w-[160px] shrink-0 truncate rounded-full border border-sidebar-border bg-muted px-3 py-1.5 text-left text-sm transition-transform active:scale-95 active:bg-sidebar-border"
              >
                {text}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 하단 줄: + / 입력창 / 첨부 / 전송 */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-1.5 p-3">
        <Button type="button" size="icon" variant="ghost" className="rounded-full shrink-0" aria-label="더보기">
          <Plus size={20} />
        </Button>

        <input
          {...register("content")}
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
          disabled={!isValid || isSending}
          className={`rounded-full shrink-0 ${isValid ? "bg-primary-press" : ""}`}
          aria-label="전송"
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  )
}