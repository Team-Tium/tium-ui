import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import type { CreateFeedRequest, FeedResult } from '../types'
import { feedKeys } from './feedKeys'

/** 피드 등록 — `POST /api/v1/feed`. 성공하면 두 정렬의 목록을 모두 새로 받는다. */
export function useCreateFeed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateFeedRequest) => api.post<FeedResult>('/api/v1/feed', body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: feedKeys.lists }),
  })
}
