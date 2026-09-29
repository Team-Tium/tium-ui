import { Button } from "@/shared/components/ui/button"
import { X } from "lucide-react"

interface LeaveRoomConfirmModalProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
  isLeaving: boolean
}

/**
 * 나가기 2차 확인 — 되돌릴 수 없는 액션이라 확인 팝업을 하나 더 거친다.
 * docs/chat_api.md §5 "이 방으로는 다시 들어올 수 없다"
 */
export function LeaveRoomConfirmModal({ isOpen, onCancel, onConfirm, isLeaving }: LeaveRoomConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-muted-foreground/60 p-4">
      <div className="flex w-5/6 max-w-sm min-h-[180px] flex-col overflow-hidden rounded-md bg-background shadow-2xl">
        <div className="flex justify-between items-center px-4 py-3 border-b border-border">
          <span className="font-medium text-md">채팅방 나가기</span>
          <X className="cursor-pointer text-muted-foreground" onClick={onCancel} />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-6">
          <p className="text-center font-medium">채팅방을 나가시겠습니까?</p>

          <div className="flex w-full gap-4">
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={onCancel}
              disabled={isLeaving}
              className="flex-1 bg-background text-foreground"
            >
              취소하기
            </Button>

            <Button
              type="button"
              size="lg"
              onClick={onConfirm}
              disabled={isLeaving}
              className="flex-1 bg-primary text-primary-foreground"
            >
              나가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}