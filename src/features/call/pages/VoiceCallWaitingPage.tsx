import { Navigate, useLocation, useParams } from 'react-router-dom'

import { CallProfile } from '../components/CallProfile'
import { HangUpButton } from '../components/HangUpButton'
import { useCallWaiting } from '../hooks/useCallWaiting'
import type { VoiceCallWaitingRouteState } from '../types'

/**
 * 음성 통화 대기 — /call/voice/:roomId/waiting · docs/ia.md 4절
 *
 * 주소에 통화 번호가 없어서 준비 화면이 넘겨준 값으로 연다.
 * 그 값이 없으면(새로고침·직접 진입) 준비 화면으로 돌려보낸다.
 */
export default function VoiceCallWaitingPage() {
  const roomId = Number(useParams().roomId)
  const state = useLocation().state as VoiceCallWaitingRouteState | null

  if (!state) return <Navigate to={`/call/voice/${roomId}/ready`} replace />
  return <Waiting {...state} roomId={roomId} />
}

function Waiting({ callId, ...options }: VoiceCallWaitingRouteState & { roomId: number }) {
  const { cancel } = useCallWaiting(callId, options)

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-between pb-16">
      <CallProfile status="통화 수신 중" name={options.opponentName} />
      <HangUpButton onClick={cancel} />
    </div>
  )
}
