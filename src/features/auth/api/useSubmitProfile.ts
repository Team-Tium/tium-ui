import { useMutation } from "@tanstack/react-query"
import { api } from "@/shared/api/client"
import type { ProfileValidSchema } from "@/shared/constants/inputconfig"

/* 온보딩 단계별 저장 vs 마지막 일괄 전송 여부에서 현재는 전자를 택하여 작성함. */
export function useSubmitProfile() {
  return useMutation({
    mutationFn: (data: ProfileValidSchema) =>
      /* TODO : 지금은 임의로 작성함 => 백엔드의 API로 수정 필요 */
      api.post<void>("/onboarding/profile", data),
  })
}