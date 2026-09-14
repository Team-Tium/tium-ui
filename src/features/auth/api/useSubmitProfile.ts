import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

import { api } from "@/shared/api/client"
import type { Gender } from "@/shared/constants/inputconfig"
import type { MemberProfile } from "../types"
import { meQueryKey } from "./useMe"

/** 요청 바디. 폼 형태가 아니라 API 형태다. docs/users_api.md §2 */
export interface OnboardingProfileRequest {
  name: string
  /** yyyy-MM-dd. 폼의 YYYYMMDD 를 변환해서 넣는다 */
  birthDate: string
  /** 기본주소 + 상세주소를 합친 한 문자열 */
  address: string
  email: string
  gender: Gender
}

/**
 * 온보딩 프로필 저장 — `POST /onboarding/profile` · docs/users_api.md §2
 *
 * 저장에 성공하면 서버가 onboarding_completed 를 true 로 바꾼다.
 * 이 응답은 `GET /users/me` 와 **같은 MemberProfile 형태**라 그대로 캐시에 심는다.
 * invalidate 하면 홈으로 넘어가자마자 가드가 같은 값을 다시 받아오느라 스피너가 한 번 뜬다.
 * docs/auth_flow.md 7절 · docs/architecture.md 4절
 *
 * 온보딩은 이 화면 하나뿐이라(2026-09-10) 저장 후 바로 홈으로 보낸다. docs/ia.md 2절
 */
export function useSubmitProfile() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: OnboardingProfileRequest) =>
      api.post<MemberProfile>("/onboarding/profile", body),
    onSuccess: (profile) => {
      queryClient.setQueryData(meQueryKey, profile)
      navigate("/", { replace: true })
    },
  })
}
