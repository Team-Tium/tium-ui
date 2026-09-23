/**
 * 서버가 보내는 실시간 이벤트의 공통 형태.
 *
 * REST 응답 봉투(isSuccess/code/message/result)와 다르다.
 * 요청에 대한 답이 아니라 서버가 먼저 보내는 통보이기 때문이다.
 */
export type SocketEvent<T = unknown> = {
  type: string
  data: T
}

/** 통화 이벤트 이름. 도메인 접두어를 붙여 채팅 이벤트와 구분한다. */
export const CALL_EVENT = {
  incoming: 'CALL_INCOMING',
  accepted: 'CALL_ACCEPTED',
  signal: 'CALL_SIGNAL',
  ended: 'CALL_ENDED',
} as const

/** 구독 주소를 만든다. 주소를 문자열로 직접 쓰지 않는다. */
export const socketDestination = {
  /** 개인 알림. 채팅과 통화가 함께 쓴다. */
  user: (memberId: number) => `/sub/users/${memberId}`,
  chatRoom: (roomId: number) => `/sub/chat/rooms/${roomId}`,
  call: (callId: number) => `/sub/call/${callId}`,
}

/** 서버로 보내는 주소. */
export const socketPublishDestination = {
  callAccept: (callId: number) => `/pub/call/${callId}/accept`,
  callReject: (callId: number) => `/pub/call/${callId}/reject`,
  callSignal: (callId: number) => `/pub/call/${callId}/signal`,
}

/** 받은 문자열을 이벤트로 바꾼다. 형태가 다르면 null 을 준다. */
export function parseSocketEvent(raw: string): SocketEvent | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const event = parsed as Partial<SocketEvent>
    if (typeof event.type !== 'string') return null
    return { type: event.type, data: event.data }
  } catch {
    return null
  }
}
