import type { ReactNode } from 'react'
import { ChevronDown, UserRound } from 'lucide-react'

import { CallLogo } from './CallLogo'

type CallProfileProps = {
  /** 로고 아래 상태 문구. 예: "통화 수신 중", "통화 중" */
  status: string
  name: string
  /** 이름 아래에 붙는 것. 통화 시간 배지 등. */
  children?: ReactNode
}

/** 통화 화면 위쪽: 로고 · 상태 · 아바타 · 상대 이름. */
export function CallProfile({ status, name, children }: CallProfileProps) {
  return (
    <div className="flex flex-col items-center gap-4 pt-12">
      <CallLogo />
      <p className="text-muted-foreground flex items-center gap-1 text-xs">
        <ChevronDown className="size-3.5" aria-hidden />
        {status}
      </p>

      <div className="mt-4 flex flex-col items-center gap-4">
        <div className="border-border/60 rounded-full border-4 p-1">
          <div className="bg-border text-muted-foreground flex size-24 items-center justify-center rounded-full">
            <UserRound className="size-12" aria-hidden />
          </div>
        </div>
        <p className="text-lg font-medium">{name}</p>
        {children}
      </div>
    </div>
  )
}
