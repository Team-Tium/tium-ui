import { Link } from "react-router-dom"
import { ChevronLeft, Menu, Phone, Sparkles } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

interface ChatRoomHeaderProps {
  nickname: string
  avatarUrl: string
  onMenuClick: () => void
  onCallClick: () => void
  onFeedbackClick: () => void
}

export function ChatRoomHeader({
  nickname,
  avatarUrl,
  onMenuClick,
  onCallClick,
  onFeedbackClick,
}: ChatRoomHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-2">
        <Link to="/" className="text-muted-foreground"><ChevronLeft /></Link>
        <img
          src={avatarUrl}
          alt={nickname}
          loading="lazy"
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover bg-muted"
        />
        <span className="font-medium">{nickname}</span>
      </div>
      <div className="flex items-center gap-3">
        {/* TODO: feedback 도메인 API 명세 작성 후 연결. 전체/부분 분석 구분 여부 미정 */}
        <Button type="button" variant="ghost" size="icon" onClick={onFeedbackClick} aria-label="피드백 보기">
          <Sparkles size={20} />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={onCallClick} aria-label="통화하기">
          <Phone size={20} />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={onMenuClick} aria-label="채팅방 메뉴">
          <Menu size={20} />
        </Button>
      </div>
    </div>
  )
}