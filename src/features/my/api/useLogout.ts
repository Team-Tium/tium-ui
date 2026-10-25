import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { api } from "@/shared/api/client"
import { useAuth } from "@/app/providers/auth-context"
import { socketClient } from "@/shared/socket/client"

/**
 * 로그아웃 — docs/auth_flow.md §8
 * POST /auth/logout → 소켓 종료 → 토큰·캐시 정리(endSession) → /login
 *
 * TODO: 서버 요청이 실패해도 로컬 세션은 끝낸다. 문서에 이 경우가 없어 확인이 필요하다.
 */
export function useLogout() {
  const navigate = useNavigate()
  const { endSession } = useAuth()

  return useMutation({
    mutationFn: () => api.post<void>("/auth/logout"),
    onSettled: () => {
      socketClient.disconnect()
      endSession()
      navigate("/login", { replace: true })
    },
  })
}