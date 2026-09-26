import { PhoneOff } from 'lucide-react'

import { CallRoundButton } from './CallRoundButton'

type HangUpButtonProps = {
  onClick: () => void
  disabled?: boolean
}

/** 빨간 원형 통화 종료 버튼. */
export function HangUpButton({ onClick, disabled }: HangUpButtonProps) {
  return (
    <CallRoundButton
      Icon={PhoneOff}
      label="통화 종료"
      className="bg-destructive text-primary-foreground"
      onClick={onClick}
      disabled={disabled}
    />
  )
}
