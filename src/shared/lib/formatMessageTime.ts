/**
 * 채팅방 안, 메시지 하나하나에 붙는 시간. 목록의 formatRelativeTime과 달리
 * 날짜 구분 없이 항상 시:분만 보여준다. (날짜가 바뀌는 지점의 구분선은
 * 아직 없음 — 필요해지면 추가)
 */
export function formatMessageTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}