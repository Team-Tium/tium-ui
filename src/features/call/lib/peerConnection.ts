import type { SignalPayload } from '../types'

/**
 * 직접 연결을 찾을 때 쓰는 서버. 지금은 공개 STUN만 쓴다.
 * TURN이 생기면 통화 시작 직전에 발급받아 여기에 더한다.
 */
const ICE_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }]

/** 마이크를 잡는다. 권한을 처음 묻는 곳도 여기다. */
export function getMicrophone(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ audio: true, video: false })
}

/** 스트림의 장치를 전부 놓는다. 안 놓으면 브라우저의 마이크 표시가 계속 켜져 있다. */
export function releaseStream(stream: MediaStream) {
  for (const track of stream.getTracks()) track.stop()
}

type PeerCallbacks = {
  /** 상대에게 보내야 할 시그널링이 생겼을 때. */
  onSignal: (payload: SignalPayload) => void
  /** 상대의 음성이 도착했을 때. */
  onRemoteStream: (stream: MediaStream) => void
  /** 연결 상태가 바뀌었을 때. */
  onStateChange: (state: RTCPeerConnectionState) => void
}

export type Peer = ReturnType<typeof createPeer>

/**
 * 상대와의 WebRTC 연결 하나를 만든다.
 *
 * offer는 거는 쪽만 만든다. 양쪽이 동시에 만들면 충돌해서 연결이 꼬인다.
 * 받는 쪽은 offer가 오면 answer만 돌려준다.
 */
export function createPeer(localStream: MediaStream, callbacks: PeerCallbacks) {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
  for (const track of localStream.getTracks()) pc.addTrack(track, localStream)

  // 상대 설명(offer/answer)을 넣기 전에 도착한 후보. 버리면 연결이 안 될 수 있다.
  const pendingCandidates: RTCIceCandidateInit[] = []

  // 시그널링은 도착한 순서대로 하나씩 처리한다. 겹쳐 처리하면 상태가 어긋난다.
  let queue: Promise<void> = Promise.resolve()

  pc.onicecandidate = (event) => {
    if (event.candidate) callbacks.onSignal({ kind: 'ICE', candidate: event.candidate.toJSON() })
  }
  pc.ontrack = (event) => {
    callbacks.onRemoteStream(event.streams[0] ?? new MediaStream([event.track]))
  }
  pc.onconnectionstatechange = () => {
    callbacks.onStateChange(pc.connectionState)
  }

  async function flushCandidates() {
    while (pendingCandidates.length > 0) {
      const candidate = pendingCandidates.shift()
      await pc.addIceCandidate(candidate).catch(() => {})
    }
  }

  async function process(signal: SignalPayload) {
    if (pc.signalingState === 'closed') return

    switch (signal.kind) {
      case 'OFFER': {
        await pc.setRemoteDescription({ type: 'offer', sdp: signal.sdp })
        await flushCandidates()
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        callbacks.onSignal({ kind: 'ANSWER', sdp: answer.sdp ?? '' })
        return
      }
      case 'ANSWER': {
        // 내가 offer를 보낸 상태가 아니면 늦게 온 중복이다.
        if (pc.signalingState !== 'have-local-offer') return
        await pc.setRemoteDescription({ type: 'answer', sdp: signal.sdp })
        await flushCandidates()
        return
      }
      case 'ICE': {
        if (!pc.remoteDescription) {
          pendingCandidates.push(signal.candidate)
          return
        }
        await pc.addIceCandidate(signal.candidate).catch(() => {})
      }
    }
  }

  return {
    /** offer를 만들어 보낸다. 거는 쪽만 부른다. `iceRestart`는 끊김 복구용이다. */
    createOffer(options: { iceRestart?: boolean } = {}) {
      queue = queue
        .then(async () => {
          if (pc.signalingState === 'closed') return
          const offer = await pc.createOffer({ iceRestart: options.iceRestart })
          await pc.setLocalDescription(offer)
          callbacks.onSignal({ kind: 'OFFER', sdp: offer.sdp ?? '' })
        })
        .catch(() => {})
    },

    /** 상대가 보낸 시그널링을 넣는다. */
    handleSignal(signal: SignalPayload) {
      queue = queue.then(() => process(signal)).catch(() => {})
    },

    /** 내 목소리를 끄거나 켠다. 연결은 그대로 둔다. */
    setMuted(muted: boolean) {
      for (const track of localStream.getAudioTracks()) track.enabled = !muted
    },

    /** 연결과 마이크를 모두 정리한다. 다시 쓸 수 없다. */
    close() {
      pc.onicecandidate = null
      pc.ontrack = null
      pc.onconnectionstatechange = null
      pc.close()
      releaseStream(localStream)
    },
  }
}
