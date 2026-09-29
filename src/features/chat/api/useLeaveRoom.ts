import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { api } from "@/shared/api/client"
import type { LeaveRoomResult } from "../types"
import { chatRoomListQueryKey } from "./useChatRoomList"

/**
 * 채팅방 나가기 — `DELETE /chats/{roomId}/member/me` · docs/chat_api.md §5
 * 나가면 이 방으로 돌아올 수 없다. 성공하면 목록을 무효화하고 홈으로 보낸다.
 */
export function useLeaveRoom(roomId: number) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.delete<LeaveRoomResult>(`/chats/${roomId}/member/me`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatRoomListQueryKey })
      navigate("/", { replace: true })
    },
  })
}