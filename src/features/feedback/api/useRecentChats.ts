import { useInfiniteQuery } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import type { components } from '@/shared/api/schema'
import type { RecentChat } from '../types'
import { chatFeedbackKeys, chatFeedbackPaths } from './chatFeedbackKeys'

type RecentChatsResponse = components['schemas']['RecentFeedbackChatListDTO']

const PAGE_SIZE = 20

/** 결과 화면으로 갈 수 없는 항목(roomId 없음)은 뺀다. */
function hasRoomId(chat: RecentChat): chat is RecentChat & { roomId: number } {
  return typeof chat.roomId === 'number'
}

/**
 * 피드백 탭의 최근 채팅 — `GET /chats/feedback/recent`
 *
 * 커서 기반 무한 스크롤. 들어올 때마다 새로 받는다.
 */
export function useRecentChats() {
  return useInfiniteQuery({
    queryKey: chatFeedbackKeys.recent,
    queryFn: ({ pageParam, signal }) =>
      api.get<RecentChatsResponse>(chatFeedbackPaths.recent, {
        params: { size: PAGE_SIZE, ...(pageParam !== undefined ? { cursor: pageParam } : {}) },
        signal,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => (last.hasNext ? last.nextCursor : undefined),
    staleTime: 0,
    select: (data) => data.pages.flatMap((page) => (page.items ?? []).filter(hasRoomId)),
  })
}
