import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import type { MemberProfile } from '../types'

/** 쿼리 키는 [도메인, 리소스, 파라미터]. docs/architecture.md 4절 */
export const meQueryKey = ['users', 'me'] as const

/**
 * 내 정보 조회 — `GET /users/me` · docs/users_api.md §1
 *
 * **온보딩 완료 여부의 유일한 출처다.** localStorage 에 저장하지 않는다. docs/auth_flow.md 7절
 * 로그인 직후에는 부르지 않는다 — 그때는 로그인 응답에 이미 값이 들어 있다.
 *
 * 지금 쓰는 곳은 `RequireOnboarding` 가드뿐이다. `my` 도메인 화면이 쓰게 되면
 * shared 로 올린다 (CLAUDE.md 「features 끼리 직접 import 하지 않는다」).
 */
export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: () => api.get<MemberProfile>('/users/me'),
  })
}
