import type { ChatMessageDto, ChatMessageItem } from "../types"

/** 서버 메시지(ChatMessageDto) → 화면이 쓰는 형태(ChatMessageItem) */
export function mapChatMessage(dto: ChatMessageDto, myMemberId: number | null): ChatMessageItem {
  return {
    id: dto.messageId,
    type: dto.type,
    content: dto.content,
    sentAt: dto.sentAt,
    isRead: dto.isRead,
    mine: dto.senderId !== null && dto.senderId === myMemberId,
  }
}