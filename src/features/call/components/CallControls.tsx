import type { LucideIcon } from 'lucide-react'
import { Bluetooth, Grid3x3, Mic, MicOff, Video, Volume2 } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

type CallControlsProps = {
  muted: boolean
  onToggleMute: () => void
}

type ControlProps = {
  Icon: LucideIcon
  label: string
  active?: boolean
  onClick?: () => void
}

/** 버튼 하나. onClick 이 없으면 눌리지 않는 상태로 보인다. */
function Control({ Icon, label, active = false, onClick }: ControlProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-pressed={onClick ? active : undefined}
      className="flex flex-col items-center gap-2 disabled:opacity-40"
    >
      <span
        className={cn(
          'flex size-14 items-center justify-center rounded-full transition-colors',
          active ? 'bg-foreground text-background' : 'bg-border text-foreground',
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="text-muted-foreground text-xs">{label}</span>
    </button>
  )
}

/**
 * 통화 중 컨트롤 6개.
 *
 * 브라우저에서는 블루투스·키패드를 다룰 수 없고, 스피커는 기기 선택이 제한적이다.
 * 녹음·영상 전환은 이번 범위가 아니다. 그래서 음소거만 동작한다.
 */
export function CallControls({ muted, onToggleMute }: CallControlsProps) {
  return (
    <div className="grid grid-cols-3 gap-x-12 gap-y-6">
      <Control Icon={Bluetooth} label="블루투스" />
      <Control Icon={Volume2} label="스피커" />
      <Control Icon={Mic} label="녹음" />
      <Control Icon={Grid3x3} label="키패드" />
      <Control Icon={Video} label="영상 통화" />
      <Control Icon={MicOff} label="음소거" active={muted} onClick={onToggleMute} />
    </div>
  )
}
