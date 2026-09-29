import type { components } from "@/shared/api/schema"

/**
 * 채팅 관련 타입. schema.d.ts(openapi-typescript 생성)에서 별칭을 가져온다.
 * docs/ia.md 3절, docs/chat_api.md
 *
 * ⚠️ 생성된 스키마는 필드가 전부 optional이다(백엔드에 required 미지정).
 * ChatRoomDto 등 일부는 ERD.md 근거로 Omit + 재선언해 null 아님을 명시했다.
 * TODO: YS 확인 후 이 재선언들을 걷어내거나 유지할지 결정한다.
 */

type RawChatRoomDto = components["schemas"]["ChatRoomDTO"]
type RawOpponent = components["schemas"]["OpponentDTO"]
type RawLastMessage = components["schemas"]["LastMessageDTO"]
type RawGetChat = components["schemas"]["GetChatDTO"]

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
  /** opponentLeft가 true면 ChatListItem에서 이 값 대신 안내 문구를 보여준다 */
  lastMessage: string
  /** formatRelativeTime으로 가공된 표시용 문자열 (원본 ISO 아님) */
  time: string
  avatarUrl: string
  unreadCount: number
  opponentLeft: boolean
}

/** GET /chats/{roomId}/messages 응답의 메시지 하나 */
export interface ChatMessageDto {
  messageId: number
  /** SYSTEM 타입은 발신자가 없어 null. docs/ERD.md sender_id 컬럼 */
  senderId: number | null
  type: MessageType
  /** IMAGE면 이미지 URL. 지금은 TEXT만 보낼 수 있음(2차: IMAGE) */
  content: string
  sentAt: string
  /** 내가 보낸 메시지에만 의미 있음(상대가 읽었는지) */
  isRead: boolean
}

/** GET /chats/{roomId}/messages 응답 전체. opponent 구조는 목록 API와 동일해 재사용한다 */
export interface ChatRoomMessagesResponse {
  roomId: number
  opponent: ChatOpponent
  opponentLeft: boolean
  /** cursor 조회는 페이지 내부가 최신순(내림차순). after 조회는 useChatRoomRecovery가 별도 처리 */
  messages: ChatMessageDto[]
  hasNext: boolean
  nextCursor: number | null
}

/** POST /chats/{roomId}/messages 응답. GET 목록의 메시지와 필드가 달라(roomId 있음, isRead 없음) 별도 타입 */
export interface SendMessageResult {
  messageId: number
  roomId: number
  senderId: number
  type: MessageType
  content: string
  sentAt: string
}

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
export interface ReadReceiptResult {
  roomId: number
  lastReadMessageId: number
  readAt: string
}

/** DELETE /chats/{roomId}/member/me 응답 */
export interface LeaveRoomResult {
  roomId: number
  leftAt: string
}

/**
 * 할 말 추천 — `POST /chats/{roomId}/recommendations` 응답.
 * schema.d.ts SuggestRepliesDTO 기준. 필드명이 suggestions다
 * (docs/chat_api.md 초안엔 recommendations로 적혀 있었으나 실제 배포 기준과 다름).
 */
export type SuggestRepliesResult = components["schemas"]["SuggestRepliesDTO"]

// ── 소켓 이벤트 데이터. docs/chat_socket.md §4 ──
// MemberLeftEvent, RoomUpdatedEvent는 아직 쓰는 곳이 없어 여기서 뺐다.
// MemberLeftEvent: useChatRoomSocket이 이벤트 데이터를 안 쓰고 opponentLeft를
//   바로 true로 고정하는 방식이라 타입 캐스팅 자체가 필요 없었다.
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