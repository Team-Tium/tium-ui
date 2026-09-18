/**
 * 상대 시간 포맷. 오늘: "오후 6:21" / 어제: "어제" / 올해: "9/14" / 작년 이전: "2025/07/15"
 *
 * 현재는 채팅 목록(mapChatRoom.ts)에서만 쓰고 있음.
 * 피드백/피드 등 다른 목록 화면에서 같은 시간 표시 규칙이 필요하면 재사용,
 * 규칙이 다르면(예: "n분 전" 형식) 별도 함수로 분리할 것.
 */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  if (isSameDay(date, now)) {
    return date.toLocaleTimeString("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (isSameDay(date, yesterday)) {
    return "어제"
  }

  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const yy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yy}/${mm}/${dd}`
}