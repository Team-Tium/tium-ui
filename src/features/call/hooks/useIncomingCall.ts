import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/app/providers/auth-context'
import { socketClient } from '@/shared/socket/client'
import { CALL_EVENT, socketDestination, socketPublishDestination } from '@/shared/socket/events'
import { useSubscription } from '@/shared/socket/useSubscription'
import { getMicrophone, releaseStream } from '../lib/peerConnection'
import type { CallIncomingData, IncomingCall, VoiceCallRouteState } from '../types'

/**
 * 착신 모달이 쓰는 훅.
 *
 * 개인 알림 주소로 오는 착신을 받아 들고 있는다. 이 값은 모달 안에만 있다.
 * 다른 기기에서 받았거나(CALL_ACCEPTED) 걸던 사람이 끊으면(CALL_ENDED) 모달을 닫는다.
 */
export function useIncomingCall() {
  const navigate = useNavigate()
  const { memberId } = useAuth()
  const [incoming, setIncoming] = useState<IncomingCall | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)

  const close = useCallback(() => {
    setIncoming(null)
    setError(null)
    setAccepting(false)
  }, [])

  useSubscription(memberId !== null ? socketDestination.user(memberId) : null, (event) => {
    if (event.type === CALL_EVENT.incoming) {
      const data = event.data as CallIncomingData
      // 영상 통화 화면은 아직 없다. 음성만 받는다.
      if (data.type !== 'VOICE') return
      setIncoming((current) => current ?? { callId: data.callId, callerName: data.caller.nickname })
      return
    }
    if (event.type === CALL_EVENT.accepted || event.type === CALL_EVENT.ended) {
      const { callId } = event.data as { callId: number }
      setIncoming((current) => (current?.callId === callId ? null : current))
    }
  })

  /**
   * 받는다. 마이크 권한만 확인하고 통화 중 화면으로 넘긴다.
   * 수락 신호는 통화 중 화면이 구독과 연결 준비를 마친 뒤에 보낸다.
   */
  const accept = useCallback(async () => {
    if (!incoming) return
    setError(null)
    setAccepting(true)
    try {
      releaseStream(await getMicrophone())
    } catch {
      setError('마이크 권한을 허용해야 받을 수 있어요.')
      setAccepting(false)
      return
    }
    const state: VoiceCallRouteState = { isCaller: false, opponentName: incoming.callerName }
    navigate(`/call/voice/${incoming.callId}`, { state })
    close()
  }, [close, incoming, navigate])

  /** 거절한다. 서버가 통화를 닫고 거는 사람에게 알린다. */
  const reject = useCallback(() => {
    if (!incoming) return
    socketClient.publish(socketPublishDestination.callReject(incoming.callId))
    close()
  }, [close, incoming])

  return { incoming, error, accepting, accept, reject }
}
