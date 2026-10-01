import type { AcceptanceAnchor } from '../types'

const KST_OFFSET_MS = 9 * 3600_000

/**
 * 녹음을 시작한 시각을 서버 기준 시각(+09:00)으로 만든다.
 *
 * 서버가 준 수락 시각에, 수락 이벤트를 받은 순간부터 녹음 시작까지 흐른 시간을 더한다.
 * 기기 시계가 틀려도 두 사람의 녹음 시각이 같은 기준으로 맞춰진다.
 */
export function makeStartedAt(anchor: AcceptanceAnchor, startMonoMs: number): string {
  // 오프셋이 없으면 +09:00으로 간주한다. 서버가 소켓 acceptedAt에 오프셋을 붙이면 필요 없다.
  const hasOffset = /(Z|[+-]\d{2}:\d{2})$/.test(anchor.acceptedAt)
  const base = Date.parse(hasOffset ? anchor.acceptedAt : `${anchor.acceptedAt}+09:00`)
  const epochMs = base + (startMonoMs - anchor.receivedMonoMs)
  return new Date(epochMs + KST_OFFSET_MS).toISOString().replace('Z', '+09:00')
}
