import { useNavigate } from "react-router-dom"

import type { Chat } from "../types"

interface ChatListItemProps {
  chat: Chat
}

export function ChatListItem({ chat }: ChatListItemProps) {
  const navigate = useNavigate()
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-muted/50"
      onClick={() => navigate(`/chat/${chat.id}`)}
    >
      <img
        src={chat.avatarUrl}
        alt={chat.name}
        loading="lazy"
        width={48}
        height={48}
        className="h-12 w-12 shrink-0 rounded-full object-cover bg-muted"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-medium">{chat.name}</span>
        <span className="truncate text-sm text-muted-foreground">
          {/* 상대가 나간 방은 마지막 메시지보다 이 상태를 우선 표시한다 */}
          {chat.opponentLeft ? "상대방이 나간 채팅방이에요" : chat.lastMessage}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-xs text-muted-foreground">{chat.time}</span>
        {chat.unreadCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-primary-foreground">
            {chat.unreadCount}
          </span>
        )}
      </div>
    </div>
  )
}