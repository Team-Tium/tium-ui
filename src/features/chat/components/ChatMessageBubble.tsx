import type { ChatMessageItem } from "../types"
import { formatMessageTime } from "@/shared/lib/formatMessageTime"
import { Avatar } from "@/shared/components/Avatar"

interface ChatMessageBubbleProps {
  message: ChatMessageItem
  /** 상대방 프로필 이미지. showAvatar가 true일 때만 실제로 그려진다 */
  avatarUrl: string
  /**
   * 연속된 상대 메시지 묶음의 첫 번째(=프로필을 보여줄) 메시지인지.
   * 내 메시지에는 프로필 영역 자체가 없다.
   */
  showAvatar: boolean
  /** 같은 사람이 같은 분에 보낸 묶음의 마지막 메시지에만 시간을 붙인다 */
  showTime: boolean
}

export function ChatMessageBubble({ message, avatarUrl, showAvatar, showTime }: ChatMessageBubbleProps) {
  if (message.type === "SYSTEM") {
    // 현재 SYSTEM 메시지를 만드는 곳은 없다(docs/ERD.md 미결 항목 6). 응답 스펙에만 대비해둔다
    return <div className="py-2 text-center text-xs text-muted-foreground">{message.content}</div>
  }

  return (
    <div className={`flex items-end gap-1.5 px-4 py-1 ${message.mine ? "flex-row-reverse" : "flex-row"}`}>
      {!message.mine && (
        // 프로필 자리를 항상 확보해서, showAvatar가 false여도 말풍선 위치가 흔들리지 않게 한다
        <div className="h-7 w-7 shrink-0">
          {showAvatar && (
            <Avatar src={avatarUrl} size={28} />
          )}
        </div>
      )}

      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
          message.mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        }`}
      >
        {message.content}
      </div>
      {showTime && (
        <time dateTime={message.sentAt} className="shrink-0 text-[10px] text-muted-foreground">
          {formatMessageTime(message.sentAt)}
        </time>
      )}
    </div>
  )
}