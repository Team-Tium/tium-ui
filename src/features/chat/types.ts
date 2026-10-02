import type { components } from "@/shared/api/schema"

/**
 * 채팅 관련 타입. schema.d.ts(생성)에서 별칭을 가져온다. docs/chat_api.md
 * ⚠️ 스키마는 전부 optional이다. ERD.md 근거로 일부는 Omit + 재선언해 null 아님을 명시했다.
 * TODO: YS 확인 후 재선언 유지 여부 결정.
 */

type RawChatRoomDto = components["schemas"]["ChatRoomDTO"]
type RawOpponent = components["schemas"]["OpponentDTO"]
type RawLastMessage = components["schemas"]["LastMessageDTO"]
type RawGetChat = components["schemas"]["GetChatDTO"]
type RawMessageDto = components["schemas"]["MessageDTO"]
type RawGetMessages = components["schemas"]["GetMessagesDTO"]
type RawSendMessageResult = components["schemas"]["SendMessageResultDTO"]
type RawReadReceiptResult = components["schemas"]["ReadMessageResultDTO"]
type RawLeaveRoomResult = components["schemas"]["LeaveRoomResultDTO"]

export type MessageType = "TEXT" | "IMAGE" | "SYSTEM"

/** ERD.md: profile_image_url 컬럼 없음(미결 7). TODO: YS 확인 전까지 기본값 대체 안 함 */
export type ChatOpponent = Required<Pick<RawOpponent, "userId" | "nickname">> & {
  profileImageUrl: RawOpponent["profileImageUrl"]
}

export type ChatLastMessage = Required<RawLastMessage>

/** ERD.md: lastMessage 없는 방은 목록에서 제외된다(null 아님) */
export type ChatRoomDto = Omit<
  RawChatRoomDto,
  "roomId" | "opponentLeft" | "opponent" | "lastMessage" | "unreadCount"
> & {
  roomId: number
  opponentLeft: boolean
  opponent: ChatOpponent
  lastMessage: ChatLastMessage
  unreadCount: number
}

export type ChatRoomListResponse = Omit<RawGetChat, "rooms"> & {
  rooms: ChatRoomDto[]
}

/** 화면(ChatListItem 등)에서 쓰는 형태. ChatRoomDto → Chat 변환은 mapChatRoom이 담당 */
export interface Chat {
  id: number
  name: string
  lastMessage: string
  time: string
  avatarUrl: string
  unreadCount: number
  opponentLeft: boolean
}

/** senderId는 SYSTEM 타입일 때만 null */
export type ChatMessageDto = Omit<
  RawMessageDto,
  "messageId" | "type" | "content" | "sentAt" | "isRead"
> & {
  messageId: number
  type: MessageType
  content: string
  sentAt: string
  isRead: boolean
}

/** opponent 구조는 목록 API와 동일해 재사용한다 */
export type ChatRoomMessagesResponse = Omit<
  RawGetMessages,
  "roomId" | "opponent" | "opponentLeft" | "messages" | "hasNext"
> & {
  roomId: number
  opponent: ChatOpponent
  opponentLeft: boolean
  messages: ChatMessageDto[]
  hasNext: boolean
}

export type SendMessageResult = Required<RawSendMessageResult>

/** 화면에서 쓰는 메시지 하나의 형태 */
export interface ChatMessageItem {
  id: number
  type: MessageType
  content: string
  sentAt: string
  isRead: boolean
  /** 내가 보낸 메시지인지. 좌/우 정렬에 쓴다 */
  mine: boolean
}

export type ReadReceiptResult = Required<RawReadReceiptResult>
export type LeaveRoomResult = Required<RawLeaveRoomResult>

/** 필드명이 suggestions다(docs/chat_api.md 초안의 recommendations와 다름) */
export type SuggestRepliesResult = components["schemas"]["SuggestRepliesDTO"]

/**
 * 소켓 이벤트. docs/chat_socket.md §4. REST 스펙 밖이라 손으로 쓴다.
 * RoomUpdatedEvent/MemberLeftEvent는 개인 주소(/sub/users/{memberId})로 온다.
 * RoomUpdatedEvent.lastMessage는 type 필드가 없어 기존 값과 병합해야 한다.
 */

export interface MessageCreatedEvent {
  messageId: number
  roomId: number
  senderId: number
  type: MessageType
  content: string
  sentAt: string
}

export interface MessageReadEvent {
  roomId: number
  readerId: number
  lastReadMessageId: number
}

export interface RoomUpdatedEvent {
  roomId: number
  lastMessage: { messageId: number; content: string; sentAt: string }
  unreadCount: number
}

export interface MemberLeftEvent {
  roomId: number
  leftMemberId: number
}