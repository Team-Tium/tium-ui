/**
 * 채팅 목록(GET /chats) 관련 타입.
 * 서버 응답 구조와 nullable 여부는 API 명세서(Response Body) 기준이다.
 * docs/ia.md 3절 (Chat page 1, 최근 채팅 목록)
 */

export type MessageType = "TEXT" | "IMAGE" | "VIDEO"

export interface ChatOpponent {
  userId: number
  nickname: string
  /** 프로필 사진 미등록 시 null. mapChatRoom 에서 기본 이미지로 대체한다. */
  profileImageUrl: string | null
}

export interface ChatLastMessage {
  messageId: number
  content: string
  type: MessageType
  /** ISO 8601. 화면 표시는 formatChatTime 참고하면 된다. */
  sentAt: string
}

/**
 * 서버 원본 응답(방 하나). api/ 레이어 밖으로 내보내지 않는다.
 * docs/architecture.md 3절 — 화면 코드는 이 구조를 몰라야 한다.
 */
export interface ChatRoomDto {
  /** null 가능. mapChatRoom 에서 null 이면 해당 방을 화면에서 제외한다. */
  roomId: number | null
  opponentLeft: boolean
  opponent: ChatOpponent
  lastMessage: ChatLastMessage | null
  /** null 가능. mapChatRoom에서 0으로 대체한다. */
  unreadCount: number | null
}

/** GET /chats 응답 전체 */
export interface ChatRoomListResponse {
  /** null 가능. mapChatRoom 호출 전 빈 배열로 대체해야 한다. */
  rooms: ChatRoomDto[] | null
  hasNext: boolean
  /** 커서 기반 페이지네이션. hasNext가 false면 null이다. */
  nextCursor: number | null
}

/**
 * 화면(ChatListItem 등)에서 실제로 쓰는 형태.
 * ChatRoomDto → Chat 변환은 mapChatRoom이 담당한다.
 */
export interface Chat {
  id: number
  name: string
  /** opponentLeft가 true면 ChatListItem에서 이 값 대신 안내 문구를 보여준다. */
  lastMessage: string
  /** formatChatTime으로 가공된 표시용 문자열 (원본 ISO 아님) */
  time: string
  avatarUrl: string
  unreadCount: number
  opponentLeft: boolean
}