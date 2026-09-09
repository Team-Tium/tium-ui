import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

import { useAuth } from "@/app/providers/auth-context"
import { api } from "@/shared/api/client"
import type { Gender } from "@/shared/constants/inputconfig"

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

/** 응답 result. 봉투(isSuccess/code/message/result)는 인터셉터가 벗긴다. */
export interface MemberProfile {
  memberId: number
  name: string | null
  email: string | null
  phoneNumber: string | null
  address: string | null
  gender: Gender | null
  birthDate: string | null
  introduction: string | null
  onboardingCompleted: boolean
}

/**
 * 온보딩 프로필 저장 — `POST /onboarding/profile` · docs/users_api.md §2
 *
 * 저장에 성공하면 서버가 onboarding_completed 를 true 로 바꾼다. 그 값을 그대로 세션에 반영해야
 * 새로고침했을 때 온보딩으로 되돌아가지 않는다(docs/auth_flow.md 7절의 localStorage 임시조치).
 * `GET /users/me` 가 붙으면 completeOnboarding 대신 그 쿼리를 무효화하는 방식으로 바꾼다.
 */
export function useSubmitProfile() {
  const navigate = useNavigate()
  const { completeOnboarding } = useAuth()

  return useMutation({
    mutationFn: (body: OnboardingProfileRequest) =>
      api.post<MemberProfile>("/onboarding/profile", body),
    onSuccess: (profile) => {
      if (profile.onboardingCompleted) completeOnboarding()
      navigate("/onboarding/permission", { replace: true })
    },
  })
}
