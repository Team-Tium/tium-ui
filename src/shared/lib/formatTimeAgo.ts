const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const KST_OFFSET_MS = 9 * HOUR

/**
 * 지난 시간 포맷. "방금 전" / "5분 전" / "3시간 전" / 올해: "9/14" / 작년 이전: "2025/07/15"
 *
 * 시간대 표기가 없으면 한국 시각으로 본다. 초 아래 자리는 3자리까지만 읽는다(일부 브라우저가 더 긴 값을 못 읽는다).
 */
export function formatTimeAgo(createdAt: string, now = Date.now()): string {
  const trimmed = createdAt.replace(/(\.\d{3})\d+/, '$1')
  const hasOffset = /(Z|[+-]\d{2}:?\d{2})$/.test(trimmed)
  const time = Date.parse(hasOffset ? trimmed : `${trimmed}+09:00`)
  if (Number.isNaN(time)) return ''

  const diff = now - time
  if (diff < MINUTE) return '방금 전'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`

  const date = new Date(time + KST_OFFSET_MS)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  if (year === new Date(now + KST_OFFSET_MS).getUTCFullYear()) return `${month}/${day}`
  return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`
}
