import { useQuery } from "@tanstack/react-query"
import { api } from "@/shared/api/client"
import type { MyProfile } from "../types"

/**
 * 쿼리 키는 features/auth의 meQueryKey와 같아야 한다.
 * 다르면 저장 뒤 RequireOnboarding이 든 값이 갱신되지 않는다.
 */
export const myProfileQueryKey = ["users", "me"] as const

/** docs/users_api.md §1 */
export function useMyProfile() {
  return useQuery({
    queryKey: myProfileQueryKey,
    queryFn: () => api.get<MyProfile>("/users/me"),
  })
}