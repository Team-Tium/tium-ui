import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { api } from "@/shared/api/client"
import type { components } from "@/shared/api/schema"
import { myProfileQueryKey } from "./useMyProfile"

type RawOnboardingProfile = components["schemas"]["OnboardingProfileDTO"]

/** 이메일은 서버가 받지 않아 요청에 없다. docs/users_api.md §2 */
export type UpdateProfileRequest = Required<
  Pick<RawOnboardingProfile, "name" | "birthDate" | "address" | "gender">
>

/**
 * POST /onboarding/profile · docs/users_api.md §2 — 프로필 수정에도 같이 쓴다고 문서가 명시한다.
 * TODO: 저장 후 /my로 이동한다. 문서에 이동 규칙이 없어 일반적인 방식으로 정했다.
 */
export function useUpdateProfile() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => api.post<void>("/onboarding/profile", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myProfileQueryKey })
      navigate("/my", { replace: true })
    },
  })
}