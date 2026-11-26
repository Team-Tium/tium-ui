import { Fragment } from "react"

import type { ChatMessageItem } from "../types"
import { ChatMessageBubble } from "./ChatMessageBubble"
import { formatMessageDate, isSameDay, isSameMinute } from "@/shared/lib/formatMessageTime"

interface ChatMessageListProps {
  /** 오래된 메시지 → 최신 메시지 순 */
  messages: ChatMessageItem[]
  avatarUrl: string
}

/**
 * 채팅방 메시지 목록. 카카오톡처럼 그린다.
 * - 날이 바뀌는 첫 메시지 위에 날짜 구분선을 긋는다.
 * - 같은 사람이 같은 분에 연달아 보낸 메시지는 한 묶음이다.
 *   프로필은 묶음의 첫 메시지에, 시간은 마지막 메시지에만 붙인다.
 */
export function ChatMessageList({ messages, avatarUrl }: ChatMessageListProps) {
  return messages.map((message, index) => {
    const prev = messages[index - 1]
    const next = messages[index + 1]
    const isNewDay = !prev || !isSameDay(prev.sentAt, message.sentAt)

    return (
      <Fragment key={message.id}>
        {isNewDay && <DateDivider date={message.sentAt} />}
        <ChatMessageBubble
          message={message}
          avatarUrl={avatarUrl}
          showAvatar={!message.mine && (!prev || !inSameGroup(prev, message))}
          showTime={!next || !inSameGroup(message, next)}
        />
      </Fragment>
    )
  })
}

function inSameGroup(a: ChatMessageItem, b: ChatMessageItem) {
  return (
    a.type !== "SYSTEM" &&
    b.type !== "SYSTEM" &&
    a.mine === b.mine &&
    isSameMinute(a.sentAt, b.sentAt)
  )
}

function DateDivider({ date }: { date: string }) {
  const label = formatMessageDate(date)
  return (
    <div role="separator" aria-label={label} className="flex items-center gap-3 px-4 pt-5 pb-3">
      <span className="bg-border h-px flex-1" />
      <time dateTime={date} className="text-caption text-muted-foreground">
        {label}
      </time>
      <span className="bg-border h-px flex-1" />
    </div>
  )
}
