/**
 * 채팅방 안, 메시지 하나하나에 붙는 시간. 목록의 formatRelativeTime과 달리
 * 항상 시:분만 보여준다. 날짜는 날이 바뀌는 지점의 구분선(formatMessageDate)이 맡는다.
 */
export function formatMessageTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

/** 날짜 구분선 문구. 올해면 "11월 26일 목요일", 다른 해면 "2025년 11월 26일 목요일" */
export function formatMessageDate(isoString: string): string {
  const date = new Date(isoString)
  const thisYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString("ko-KR", {
    year: thisYear ? undefined : "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })
}

/** 두 시각이 같은 날(기기 시간대 기준)인지 */
export function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

/** 두 시각이 같은 날 같은 분인지. 말풍선 시간을 묶어 한 번만 보여줄 때 쓴다 */
export function isSameMinute(a: string, b: string): boolean {
  const x = new Date(a)
  const y = new Date(b)
  return isSameDay(a, b) && x.getHours() === y.getHours() && x.getMinutes() === y.getMinutes()
}
