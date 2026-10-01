import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { LeaveRoomConfirmModal } from "./LeaveRoomConfirmModal"

interface ChatRoomMenuModalProps {
  isOpen: boolean
  onClose: () => void
  onLeave: () => void
  opponentId: number
  opponentNickname: string
  opponentAvatarUrl: string
  isLeaving: boolean
}

/**
 * 채팅방 설정 — docs/ia.md 3절 (Chat page 2 우측 상단, ChatRoomMenuModal.tsx)
 *
 * 신고하기는 팝업이 아니라 신고서 작성 페이지(/report/:targetId, ReportPage.tsx)로
 * 이동한다. ReportPage 자체는 아직 구현 전(별도 작업).
 * TODO: :targetId가 상대 memberId인지 확정 필요. docs/ia.md "정해야 하는 것" 5번.
 *
 */
export function ChatRoomMenuModal({
  isOpen,
  onClose,
  onLeave,
  opponentId,
  opponentNickname,
  opponentAvatarUrl,
  isLeaving,
}: ChatRoomMenuModalProps) {
  const navigate = useNavigate()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  if (!isOpen) return null

  const handleReport = () => {
    onClose()
    navigate(`/report/${opponentId}`)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-muted-foreground/60 p-4">
        <div className="flex w-5/6 max-w-sm min-h-[280px] flex-col overflow-hidden rounded-md bg-background shadow-2xl">
          <div className="flex justify-between items-center px-4 py-3 border-b border-border">
            <span className="font-medium text-md">채팅방 설정</span>
            <X className="cursor-pointer text-muted-foreground" onClick={onClose} />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-24 px-4 py-8">
            <img
              src={opponentAvatarUrl}
              alt={opponentNickname}
              loading="lazy"
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover bg-muted"
            />

            <div className="flex w-full flex-col gap-4">
              <Button
                type="button"
                size="lg"
                onClick={handleReport}
                className="w-full bg-primary text-primary-foreground"
              >
                신고하기
              </Button>

              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => setIsConfirmOpen(true)}
                className="w-full bg-background text-foreground"
              >
                채팅방 나가기
              </Button>
            </div>
          </div>
        </div>
      </div>

      <LeaveRoomConfirmModal
        isOpen={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={onLeave}
        isLeaving={isLeaving}
      />
    </>
  )
}