import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import type { components } from '@/shared/api/schema'
import type { CallOpponent } from '../types'

type GetMessagesDTO = components['schemas']['GetMessagesDTO']

/**
 * 채팅방 번호로 통화 상대를 찾는다.
 *
 * 시작 API는 채팅방 번호가 아니라 상대 회원 ID를 받는다. 채팅방 상세 조회 API가 따로 없어서
 * 채팅 내역 조회(`GET /chats/{roomId}/messages`)를 한 건만 불러 응답의 opponent를 쓴다.
 */
export function useCallOpponent(roomId: number) {
  return useQuery({
    queryKey: ['call', 'opponent', roomId],
    queryFn: () =>
      api.get<GetMessagesDTO>(`/chats/${roomId}/messages`, { params: { size: 1 } }),
    enabled: Number.isFinite(roomId),
    select: (data): CallOpponent | null =>
      data.opponent?.userId === undefined
        ? null
        : { userId: data.opponent.userId, nickname: data.opponent.nickname ?? '' },
  })
}
