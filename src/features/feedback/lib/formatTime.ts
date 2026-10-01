/** 초를 "01:13" 형태로. 한 시간을 넘으면 "1:02:03". */
export function formatClock(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec))
  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor((sec % 3600) / 60)
  const seconds = sec % 60
  const mmss = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  return hours > 0 ? `${hours}:${mmss}` : mmss
}

const DATE_FORMAT = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

/** 통화 시각을 "9월 29일 오후 1:55" 형태로. 읽을 수 없는 값이면 빈 문자열. */
export function formatCallDate(iso?: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : DATE_FORMAT.format(date)
}
