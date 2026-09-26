import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { CALL_EVENT, socketDestination } from '@/shared/socket/events'
import { useSubscription } from '@/shared/socket/useSubscription'
import { useEndCall } from '../api/useEndCall'
import type { CallEndRouteState, VoiceCallRouteState } from '../types'

/** 상대가 받지 않으면 이 시간 뒤에 끊는다. */
const NO_ANSWER_MS = 30_000

type Options = {
  opponentName: string
  roomId: number
}

/**
 * 거는 사람의 대기 화면이 쓰는 훅.
 *
 * 통화 주소를 들으며 상대의 수락을 기다린다.
 * 수락하면 통화 중 화면으로, 거절·무응답·내가 끊으면 종료 화면으로 보낸다.
 */
export function useCallWaiting(callId: number, { opponentName, roomId }: Options) {
  const navigate = useNavigate()
  const endCall = useEndCall()
  const doneRef = useRef(false)

  const goToEnd = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    const state: CallEndRouteState = { roomId }
    navigate(`/call/${callId}/end`, { replace: true, state })
  }, [callId, navigate, roomId])

  /** 수락 전에 끊는다. 서버가 CANCELED로 저장한다. */
  const cancel = useCallback(() => {
    if (doneRef.current) return
    endCall.mutate(callId)
    goToEnd()
  }, [callId, endCall, goToEnd])

  const cancelRef = useRef(cancel)
  useEffect(() => {
    cancelRef.current = cancel
  })

  useSubscription(socketDestination.call(callId), (event) => {
    if (event.type === CALL_EVENT.accepted) {
      if (doneRef.current) return
      doneRef.current = true
      const state: VoiceCallRouteState = { isCaller: true, opponentName, roomId }
      navigate(`/call/voice/${callId}`, { replace: true, state })
      return
    }
    // 거절이면 서버가 통화를 닫고 알려준다.
    if (event.type === CALL_EVENT.ended) goToEnd()
  })

  useEffect(() => {
    const timer = window.setTimeout(() => cancelRef.current(), NO_ANSWER_MS)
    return () => window.clearTimeout(timer)
  }, [])

  // 새로고침하면 수락을 기다리던 통화를 되찾을 수 없다. 나가기 전에 한 번 묻는다.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  return { cancel }
}
