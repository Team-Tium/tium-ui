import { useLocation, useParams } from 'react-router-dom'

import { CallControls } from '../components/CallControls'
import { CallProfile } from '../components/CallProfile'
import { HangUpButton } from '../components/HangUpButton'
import { useVoiceCall } from '../hooks/useVoiceCall'
import { formatCallDuration } from '../lib/formatCallDuration'
import type { CallPhase, VoiceCallRouteState } from '../types'

const STATUS_TEXT: Record<CallPhase, string> = {
  connecting: '연결 중',
  connected: '통화 중',
  unstable: '연결이 불안정해요',
  ended: '통화 종료',
}

/**
 * 음성 통화 화면 — /call/voice/:callId · docs/ia.md 4절
 *
 * 대기 화면(거는 쪽)이나 착신 팝업(받는 쪽)이 넘겨준 값으로 연다.
 * 넘겨받은 값이 없으면 받는 쪽으로 본다.
 */
export default function VoiceCallPage() {
  const callId = Number(useParams().callId)
  const state = useLocation().state as VoiceCallRouteState | null

  return (
    <VoiceCall
      // 다른 통화로 옮겨가면 연결을 새로 만든다.
      key={callId}
      callId={callId}
      isCaller={state?.isCaller ?? false}
      opponentName={state?.opponentName ?? ''}
      roomId={state?.roomId}
    />
  )
}

function VoiceCall({ callId, ...options }: VoiceCallRouteState & { callId: number }) {
  const { phase, muted, elapsedSec, toggleMute, hangUp, remoteAudioRef } = useVoiceCall(
    callId,
    options,
  )

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-between pb-12">
      <CallProfile status={STATUS_TEXT[phase]} name={options.opponentName}>
        {phase !== 'connecting' && (
          <span className="bg-border flex items-center gap-2 rounded-full px-4 py-1.5 text-sm tabular-nums">
            <span className="bg-muted-foreground size-1.5 rounded-full" aria-hidden />
            {formatCallDuration(elapsedSec)}
          </span>
        )}
      </CallProfile>

      <div className="flex flex-col items-center gap-8">
        <CallControls muted={muted} onToggleMute={toggleMute} />
        <HangUpButton onClick={hangUp} disabled={phase === 'ended'} />
      </div>

      {/* 상대 목소리. 화면에는 보이지 않는다. */}
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  )
}
