import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { feedKeys } from './feedKeys'

/** 피드 삭제 — `DELETE /api/v1/feed/{feedId}`. 성공하면 피드 목록, 내 글 목록, 하트 기록을 새로 받는다. */
export function useDeleteFeed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (feedId: number) => api.delete<null>(`/api/v1/feed/${feedId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: feedKeys.all }),
  })
}
