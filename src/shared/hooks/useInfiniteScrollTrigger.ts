import { useEffect, useRef } from "react"

/**
 * 리스트 맨 아래 감지 엘리먼트가 화면에 보이면 onIntersect 를 호출한다.
 * 무한 스크롤 화면 공용. docs/architecture.md 5-2
 */
export function useInfiniteScrollTrigger(onIntersect: () => void, enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && enabled) onIntersect()
      },
      { threshold: 0.1 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [onIntersect, enabled])

  return sentinelRef
}