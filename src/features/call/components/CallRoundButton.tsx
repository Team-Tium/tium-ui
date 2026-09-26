import type { LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

type CallRoundButtonProps = {
  Icon: LucideIcon
  label: string
  /** 배경·글자 색 클래스. 토큰으로만 준다. */
  className: string
  onClick: () => void
  disabled?: boolean
}

/** 아래에 이름이 붙는 큰 원형 버튼. 통화 종료·통화 받기에 쓴다. */
export function CallRoundButton({ Icon, label, className, onClick, disabled }: CallRoundButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-2 disabled:opacity-50"
    >
      <span
        className={cn(
          'flex size-16 items-center justify-center rounded-full transition-opacity active:opacity-80',
          className,
        )}
      >
        <Icon className="size-7" aria-hidden />
      </span>
      <span className="text-muted-foreground text-xs">{label}</span>
    </button>
  )
}
