import { useMutation } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import type { CreateChatRoomResult } from '../types'

/**
 * 채팅 시작 — `POST /chats`
 *
 * 같은 상대와 열린 방이 있으면 그 방을 돌려준다. 새 방은 첫 메시지를 보내기 전까지
 * 채팅 목록에 나오지 않아 무효화할 캐시가 없다.
 */
export function useStartChat() {
  return useMutation({
    mutationFn: (opponentId: number) =>
      api.post<CreateChatRoomResult>('/chats', { opponentId }),
  })
}
