import type { AcceptanceAnchor, RecordingFailure, RecordingOutcome } from '../types'
import { makeStartedAt } from './recordingTime'

/**
 * 앞에서부터 먼저 되는 형식을 쓴다. 사파리 18.4 전은 mp4만 된다.
 * 크롬은 mp4를 된다고 답하지만 실제로 녹음하면 바로 EncodingError가 나서 webm을 먼저 둔다.
 */
const MIME_TYPES = ['audio/webm;codecs=opus', 'audio/mp4;codecs=mp4a.40.2']
const AUDIO_BITS_PER_SECOND = 32_000
const CHUNK_MS = 1_000
/** 모은 크기가 이것을 넘으면 녹음을 버린다. */
const MAX_BYTES = 20_000_000
/** stop() 뒤 이 시간 안에 끝나지 않으면 녹음 실패로 본다. */
const STOP_TIMEOUT_MS = 2_000

type Options = {
  callId: number
  /** 통화 도중 녹음이 실패했을 때. 통화는 계속된다. */
  onFailed?: (reason: RecordingFailure) => void
}

export type LocalRecording = ReturnType<typeof createLocalRecording>

function pickMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null
  return MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null
}

/**
 * 내 목소리만 녹음하는 녹음기 하나를 만든다.
 *
 * 통화에 쓰는 마이크 스트림을 그대로 받는다. 트랙의 주인은 통화 연결이라 여기서 stop 하지 않는다.
 * 1초 조각으로 모았다가 끝에 한 파일로 합친다. 연결이 흔들려도 멈추지 않는다.
 */
export function createLocalRecording(stream: MediaStream, { callId, onFailed }: Options) {
  let recorder: MediaRecorder | null = null
  let mimeType = ''
  let startedAt = ''
  const chunks: Blob[] = []
  let size = 0
  let failure: RecordingFailure | null = null
  let result: Promise<RecordingOutcome> | null = null

  function detach(rec: MediaRecorder) {
    rec.ondataavailable = null
    rec.onerror = null
    rec.onstop = null
  }

  function fail(reason: RecordingFailure) {
    if (failure) return
    failure = reason
    chunks.length = 0
    if (recorder) {
      detach(recorder)
      if (recorder.state !== 'inactive') recorder.stop()
    }
    onFailed?.(reason)
  }

  /** 녹음기를 멈추고 마지막 조각까지 받는다. 시간 안에 못 받으면 false. */
  function waitForStop(rec: MediaRecorder): Promise<boolean> {
    if (rec.state === 'inactive') return Promise.resolve(true)
    return new Promise((resolve) => {
      const timer = window.setTimeout(() => resolve(false), STOP_TIMEOUT_MS)
      rec.onstop = () => {
        window.clearTimeout(timer)
        resolve(true)
      }
      rec.stop()
    })
  }

  async function finalize(): Promise<RecordingOutcome> {
    if (failure) return { kind: 'failed', reason: failure }
    if (!recorder) return { kind: 'not-recorded' }

    const rec = recorder
    const stopped = await waitForStop(rec)
    detach(rec)
    if (failure) return { kind: 'failed', reason: failure }
    if (!stopped) return { kind: 'failed', reason: 'recorder' }

    // 녹음기가 형식을 비워 두면 고른 형식으로 본다.
    const type = rec.mimeType || mimeType
    const blob = new Blob(chunks, { type })
    chunks.length = 0
    if (blob.size === 0) return { kind: 'failed', reason: 'empty' }

    const extension = type.includes('mp4') ? 'm4a' : 'webm'
    return { kind: 'ready', blob, filename: `call-${callId}-me.${extension}`, startedAt }
  }

  return {
    /** 녹음을 시작한다. 이 기기에서 녹음할 수 없으면 false. */
    start(anchor: AcceptanceAnchor): boolean {
      if (recorder || failure) return false

      const picked = pickMimeType()
      if (!picked) {
        fail('unsupported')
        return false
      }
      mimeType = picked
      try {
        const rec = new MediaRecorder(stream, {
          mimeType,
          audioBitsPerSecond: AUDIO_BITS_PER_SECOND,
        })
        rec.ondataavailable = (event) => {
          if (failure || event.data.size === 0) return
          chunks.push(event.data)
          size += event.data.size
          if (size > MAX_BYTES) fail('too-large')
        }
        rec.onerror = () => fail('recorder')
        recorder = rec
        startedAt = makeStartedAt(anchor, performance.now())
        rec.start(CHUNK_MS)
        return true
      } catch {
        fail('recorder')
        return false
      }
    },

    /** 녹음을 끝내고 파일을 만든다. 여러 번 불러도 같은 결과를 준다. */
    stop(): Promise<RecordingOutcome> {
      result ??= finalize()
      return result
    },

    /** 결과 없이 버린다. 화면을 그냥 벗어날 때 쓴다. */
    dispose() {
      chunks.length = 0
      if (!recorder) return
      detach(recorder)
      if (recorder.state !== 'inactive') recorder.stop()
    },
  }
}
