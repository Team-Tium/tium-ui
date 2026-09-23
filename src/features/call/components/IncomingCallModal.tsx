import { Phone } from 'lucide-react'

import { useIncomingCall } from '../hooks/useIncomingCall'
import { CallProfile } from './CallProfile'
import { CallRoundButton } from './CallRoundButton'
import { HangUpButton } from './HangUpButton'

/**
 * 착신 팝업 — docs/ia.md 4절
 *
 * 어느 화면에 있든 전화가 오면 떠야 해서 라우터 최상단에 붙는다. 화면 전체를 덮는다.
 */
export default function IncomingCallModal() {
  const { incoming, error, accepting, accept, reject } = useIncomingCall()
  if (!incoming) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${incoming.callerName}님의 전화`}
      className="bg-background fixed inset-0 z-50"
    >
      <div className="mx-auto flex h-full max-w-md flex-col items-center justify-between pb-16">
        <CallProfile status="통화 수신 중" name={incoming.callerName} />

        <div className="flex w-full flex-col items-center gap-4 px-10">
          {error && <p className="text-destructive text-center text-sm">{error}</p>}
          <div className="flex w-full justify-between">
            <HangUpButton onClick={reject} disabled={accepting} />
            <CallRoundButton
              Icon={Phone}
              label="통화 받기"
              className="bg-primary text-primary-foreground"
              onClick={accept}
              disabled={accepting}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
