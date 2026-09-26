import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/app/providers/auth-context'
import { socketClient } from '@/shared/socket/client'
import { CALL_EVENT, socketDestination, socketPublishDestination } from '@/shared/socket/events'
import { useSubscription } from '@/shared/socket/useSubscription'
import { useEndCall } from '../api/useEndCall'
import { createPeer, getMicrophone, type Peer } from '../lib/peerConnection'
import type {
  CallEndRouteState,
  CallPhase,
  CallSignalData,
  SignalPayload,
  VoiceCallRouteState,
} from '../types'

/** 연결이 흔들린 뒤 스스로 돌아오길 기다리는 시간. */
const UNSTABLE_WAIT_MS = 5_000
/** 재시작 offer를 보낸 뒤 연결을 기다리는 시간. 넘기면 통화를 끝낸다. */
const RESTART_WAIT_MS = 10_000

/**
 * 음성 통화 중 화면이 쓰는 훅.
 *
 * 통화 주소를 구독해 시그널링을 주고받고, WebRTC 연결을 만들고 감시한다.
 * 통화 중 상태는 이 훅 안에만 있다. 화면을 나가면 연결과 마이크를 모두 정리한다.
 *
 * 받는 쪽은 구독과 연결 준비를 마친 뒤에 수락을 보낸다.
 * 먼저 보내면 준비가 끝나기 전에 거는 쪽의 offer가 도착할 수 있다.
 */
export function useVoiceCall(callId: number, { isCaller, roomId }: VoiceCallRouteState) {
  const navigate = useNavigate()
  const { memberId } = useAuth()
  const endCall = useEndCall()

  const [phase, setPhase] = useState<CallPhase>('connecting')
  const [muted, setMuted] = useState(false)
  const [elapsedSec, setElapsedSec] = useState(0)

  const peerRef = useRef<Peer | null>(null)
  // 연결 객체가 만들어지기 전에 도착한 시그널링. 만들어지면 순서대로 넣는다.
  const pendingSignalsRef = useRef<SignalPayload[]>([])
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)
  const endedRef = useRef(false)
  const connectedAtRef = useRef<number | null>(null)
  const unstableTimerRef = useRef<number | undefined>(undefined)
  const restartTimerRef = useRef<number | undefined>(undefined)
  const restartedRef = useRef(false)

  // 연결이 만들어지기 전에 눌렀어도 만들어진 뒤 반영되도록 값을 담아둔다.
  const mutedRef = useRef(muted)
  useEffect(() => {
    mutedRef.current = muted
    peerRef.current?.setMuted(muted)
  }, [muted])

  const sendSignal = useCallback(
    (payload: SignalPayload) => {
      socketClient.publish(socketPublishDestination.callSignal(callId), payload)
    },
    [callId],
  )

  const clearRecoveryTimers = useCallback(() => {
    window.clearTimeout(unstableTimerRef.current)
    window.clearTimeout(restartTimerRef.current)
  }, [])

  /** 통화를 끝내고 종료 화면으로 간다. 여러 경로에서 불려도 한 번만 처리한다. */
  const finish = useCallback(() => {
    if (endedRef.current) return
    endedRef.current = true
    clearRecoveryTimers()
    peerRef.current?.close()
    peerRef.current = null
    setPhase('ended')

    const state: CallEndRouteState = { roomId }
    navigate(`/call/${callId}/end`, { replace: true, state })
  }, [callId, clearRecoveryTimers, navigate, roomId])

  /** 내가 끊는다. 종료 API가 실패해도 화면은 끝낸다. 서버는 끊김 유예 뒤 스스로 닫는다. */
  const hangUp = useCallback(() => {
    if (endedRef.current) return
    endCall.mutate(callId)
    finish()
  }, [callId, endCall, finish])

  // hangUp 은 mutation 객체 때문에 매 렌더 바뀐다. 타이머 안에서는 최신 것을 쓴다.
  const hangUpRef = useRef(hangUp)
  useEffect(() => {
    hangUpRef.current = hangUp
  })

  /** 연결 복구를 한 번 시도한다. 재시작 offer는 거는 쪽만 보낸다. */
  const restartIce = useCallback(() => {
    if (restartedRef.current || endedRef.current) return
    restartedRef.current = true
    if (isCaller) peerRef.current?.createOffer({ iceRestart: true })
    restartTimerRef.current = window.setTimeout(() => hangUpRef.current(), RESTART_WAIT_MS)
  }, [isCaller])

  const handleConnectionState = useCallback(
    (state: RTCPeerConnectionState) => {
      if (endedRef.current) return

      if (state === 'connected') {
        clearRecoveryTimers()
        restartedRef.current = false
        connectedAtRef.current ??= Date.now()
        setPhase('connected')
        return
      }
      if (state === 'disconnected') {
        setPhase('unstable')
        window.clearTimeout(unstableTimerRef.current)
        unstableTimerRef.current = window.setTimeout(restartIce, UNSTABLE_WAIT_MS)
        return
      }
      if (state === 'failed') {
        setPhase('unstable')
        window.clearTimeout(unstableTimerRef.current)
        restartIce()
      }
    },
    [clearRecoveryTimers, restartIce],
  )

  // 통화 주소 구독. 연결을 만들기 전에 걸어야 상대의 시그널링을 놓치지 않는다.
  useSubscription(socketDestination.call(callId), (event) => {
    if (event.type === CALL_EVENT.signal) {
      const signal = event.data as CallSignalData
      // 통화 주소는 나도 구독하므로 내가 보낸 것도 돌아온다.
      if (signal.fromMemberId === memberId) return
      if (peerRef.current) peerRef.current.handleSignal(signal)
      else pendingSignalsRef.current.push(signal)
      return
    }
    if (event.type === CALL_EVENT.ended) finish()
  })

  // 마이크를 잡고 연결을 만든다.
  // 거는 쪽은 바로 offer를 보낸다(상대가 이미 수락했다). 받는 쪽은 이제 수락을 보낸다.
  useEffect(() => {
    let cancelled = false

    getMicrophone()
      .then((stream) => {
        if (cancelled) {
          for (const track of stream.getTracks()) track.stop()
          return
        }
        const peer = createPeer(stream, {
          onSignal: sendSignal,
          onRemoteStream: (remote) => {
            if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remote
          },
          onStateChange: handleConnectionState,
        })
        peerRef.current = peer
        peer.setMuted(mutedRef.current)
        for (const signal of pendingSignalsRef.current.splice(0)) peer.handleSignal(signal)

        if (isCaller) peer.createOffer()
        else socketClient.publish(socketPublishDestination.callAccept(callId))
      })
      .catch(() => {
        // 마이크를 못 잡으면 통화를 이어갈 수 없다.
        if (!cancelled) hangUpRef.current()
      })

    return () => {
      cancelled = true
      clearRecoveryTimers()
      peerRef.current?.close()
      peerRef.current = null
    }
  }, [callId, clearRecoveryTimers, handleConnectionState, isCaller, sendSignal])

  // 통화 시간. 처음 연결된 순간부터 센다.
  useEffect(() => {
    if (phase === 'connecting' || phase === 'ended') return
    const timer = window.setInterval(() => {
      const connectedAt = connectedAtRef.current
      if (connectedAt) setElapsedSec(Math.floor((Date.now() - connectedAt) / 1000))
    }, 1_000)
    return () => window.clearInterval(timer)
  }, [phase])

  // 새로고침하면 연결을 되살릴 수 없다. 나가기 전에 한 번 묻는다.
  useEffect(() => {
    if (phase === 'ended') return
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [phase])

  const toggleMute = useCallback(() => setMuted((prev) => !prev), [])

  return { phase, muted, elapsedSec, toggleMute, hangUp, remoteAudioRef }
}
