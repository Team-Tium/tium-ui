import { useEffect, useRef } from 'react'

import { socketClient } from './client'
import type { SocketEvent } from './events'

/**
 * 화면이 떠 있는 동안만 주소를 듣는다. 화면을 나가면 자동으로 그만 듣는다.
 * 정리를 빠뜨리면 화면을 나가도 이벤트를 계속 받아 처리가 중복된다.
 *
 * `destination` 에 null 을 주면 아무것도 듣지 않는다 (아직 방 번호를 모를 때).
 */
export function useSubscription(destination: string | null, handler: (event: SocketEvent) => void) {
  // 핸들러가 매 렌더 새로 만들어져도 구독을 다시 걸지 않기 위해 담아둔다.
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    if (!destination) return
    return socketClient.subscribe(destination, (event) => handlerRef.current(event))
  }, [destination])
}
