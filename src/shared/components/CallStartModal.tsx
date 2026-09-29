import { useNavigate } from "react-router-dom"
import { X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

interface CallStartModalProps {
  isOpen: boolean
  onClose: () => void
  roomId: number
}

/**
 * 음성/영상 통화 선택 — docs/ia.md 3절 (Chat page 2-1, CallStartModal.tsx)
 * 선택하면 각 준비 화면(/call/{type}/{roomId}/ready)으로 이동시킨다.
 */
export function CallStartModal({ isOpen, onClose, roomId }: CallStartModalProps) {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleSelect = (type: "voice" | "video") => {
    onClose()
    navigate(`/call/${type}/${roomId}/ready`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-muted-foreground/60 p-4">
      <div className="flex w-5/6 max-w-sm min-h-[280px] flex-col overflow-hidden rounded-md bg-background shadow-2xl">
        <div className="flex justify-between items-center px-4 py-3 border-b border-border">
          <span className="font-medium text-md">통화 걸기</span>
          <X className="cursor-pointer text-muted-foreground" onClick={onClose} />
        </div>

        <div className="flex flex-1 flex-col justify-center gap-8 px-4 py-8">
          <Button
            type="button"
            size="lg"
            onClick={() => handleSelect("voice")}
            className="w-full bg-primary text-primary-foreground"
          >
            음성 통화 걸기
          </Button>

          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => handleSelect("video")}
            className="w-full bg-background text-foreground"
          >
            영상 통화 걸기
          </Button>
        </div>
      </div>
    </div>
  )
}