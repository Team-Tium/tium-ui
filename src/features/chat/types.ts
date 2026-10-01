import type { components } from "@/shared/api/schema"

/**
 * 채팅 관련 타입. schema.d.ts(openapi-typescript 생성)에서 별칭을 가져온다.
 * docs/ia.md 3절, docs/chat_api.md
 *
 * ⚠️ 생성된 스키마는 필드가 전부 optional이다(백엔드에 required 미지정).
 * ERD.md 근거로 Omit + 재선언해 null 아님을 명시했다.
 * TODO: YS 확인 후 이 재선언들을 걷어내거나 유지할지 결정한다.
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

/** ERD.md: member.profile_image_url 컬럼 자체가 없음(미결 항목 7). TODO: YS 확인 전까지 기본값 대체 안 함 */
export type ChatOpponent = Required<Pick<RawOpponent, "userId" | "nickname">> & {
  profileImageUrl: RawOpponent["profileImageUrl"]
}

export type ChatLastMessage = Required<RawLastMessage>

/** ERD.md: last_message_id가 null인 방(메시지 없는 방)은 목록 조회에서 제외된다 */
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

/**
 * 화면(ChatListItem 등)에서 실제로 쓰는 채팅 목록 항목 형태.
 * ChatRoomDto → Chat 변환은 mapChatRoom이 담당한다.
 */
export interface Chat {
  id: number
  name: string
  lastMessage: string
  time: string
  avatarUrl: string
  unreadCount: number
  opponentLeft: boolean
}

/** GET /chats/{roomId}/messages 응답의 메시지 하나. senderId는 SYSTEM 타입 대비 null 유지 */
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

/** GET /chats/{roomId}/messages 응답 전체. opponent 구조는 목록 API와 동일해 재사용한다 */
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

/** POST /chats/{roomId}/messages 응답 */
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

/** PATCH /chats/{roomId}/read-receipts 응답 */
export type ReadReceiptResult = Required<RawReadReceiptResult>

/** DELETE /chats/{roomId}/member/me 응답 */
export type LeaveRoomResult = Required<RawLeaveRoomResult>

/**
 * 할 말 추천 — `POST /chats/{roomId}/recommendations` 응답.
 * schema.d.ts SuggestRepliesDTO 기준. 필드명이 suggestions다
 * (docs/chat_api.md 초안엔 recommendations로 적혀 있었으나 실제 배포 기준과 다름).
 */
export type SuggestRepliesResult = components["schemas"]["SuggestRepliesDTO"]

// ── 소켓 이벤트 데이터. docs/chat_socket.md §4 ──
// MemberLeftEvent, RoomUpdatedEvent는 아직 쓰는 곳이 없어 여기서 뺐다.
// RoomUpdatedEvent: 채팅 목록 화면(ChatListPage) 소켓 연동은 별도 이슈로 남겨둔 것이라
//   그 작업을 시작할 때 다시 추가한다. docs/chat_socket.md §4-3

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