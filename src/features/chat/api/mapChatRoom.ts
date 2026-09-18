import type { Chat, ChatRoomDto } from "../types"
import { formatRelativeTime } from "@/shared/lib/formatRelativeTime"

/** 서버 응답(ChatRoomDto) → 화면이 쓰는 형태(Chat). roomId 없는 방은 걸러낸다 */
export function mapChatRoom(dto: ChatRoomDto): Chat | null {
  if (dto.roomId === null) return null

  return {
    id: dto.roomId,
    name: dto.opponent.nickname,
    lastMessage: dto.lastMessage?.content ?? "",
    time: dto.lastMessage ? formatRelativeTime(dto.lastMessage.sentAt) : "",
    avatarUrl: dto.opponent.profileImageUrl ?? "/default-avatar.png", // TODO: 실제 기본 이미지 경로로 교체
    unreadCount: dto.unreadCount ?? 0,
    opponentLeft: dto.opponentLeft,
  }
}