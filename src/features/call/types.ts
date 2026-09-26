import type { components } from '@/shared/api/schema'

/** 통화 시작·종료 응답. 필드는 전부 선택값이라 쓰는 쪽에서 비어 있을 때를 처리한다. */
export type CallResult = components['schemas']['CallResultDTO']
export type CallStartRequest = components['schemas']['CallStartDTO']
export type CallType = CallStartRequest['type']

/** 통화 상대. 채팅방 정보에서 얻는다. */
export type CallOpponent = {
  userId: number
  nickname: string
}

// ── 소켓 이벤트 ───────────────────────────────────────────────────────

/** 통화가 끝난 경로. 서버가 통화 상태를 보고 정한다. */
export type CallEndReason = 'HANGUP' | 'CANCELED' | 'REJECTED' | 'DISCONNECTED'

/** 서버로 보내는 시그널링 본문. */
export type SignalPayload =
  | { kind: 'OFFER'; sdp: string }
  | { kind: 'ANSWER'; sdp: string }
  | { kind: 'ICE'; candidate: RTCIceCandidateInit }

/** 서버가 보낸 사람 ID를 붙여 그대로 전달한 시그널링. */
export type CallSignalData = SignalPayload & {
  callId: number
  fromMemberId: number
}

export type CallAcceptedData = {
  callId: number
  acceptedAt: string
}

export type CallEndedData = {
  callId: number
  endedBy: number
  reason: CallEndReason
  endAt: string
}

// ── 화면 상태 ─────────────────────────────────────────────────────────

/**
 * 통화 중 화면의 연결 단계.
 * - connecting: 시그널링 중. 아직 음성이 오가지 않는다
 * - connected: 음성이 오간다
 * - unstable: 연결이 흔들려 복구를 기다리는 중
 * - ended: 끝났다. 곧 종료 화면으로 넘어간다
 */
export type CallPhase = 'connecting' | 'connected' | 'unstable' | 'ended'

/**
 * 통화 중 화면으로 넘기는 값.
 * 통화 중 상태를 전역에 올리지 않기 위해 이동할 때 함께 넘긴다.
 */
export type VoiceCallRouteState = {
  /** 시작 API를 부른 쪽이면 true. offer는 이쪽만 만든다. */
  isCaller: boolean
  opponentName: string
  /** 거는 쪽만 안다. 받는 쪽은 착신 이벤트에 채팅방 번호가 없다. */
  roomId?: number
}

/** 대기 화면으로 넘기는 값. 대기 화면 주소에는 callId가 없다. */
export type VoiceCallWaitingRouteState = {
  callId: number
  opponentName: string
}

/** 종료 화면으로 넘기는 값. */
export type CallEndRouteState = {
  /** 있으면 "1:1 채팅방으로 돌아가기"를 보인다. */
  roomId?: number
}

/** 착신 모달이 띄우는 전화 한 통. */
export type IncomingCall = {
  callId: number
  callerName: string
}

/** CALL_INCOMING 이벤트 본문. */
export type CallIncomingData = {
  callId: number
  type: CallType
  caller: { userId: number; nickname: string }
  createdAt: string
}
