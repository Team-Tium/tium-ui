import { useLocation, useNavigate } from 'react-router-dom'

import { CallLogo } from '../components/CallLogo'
import type { CallEndRouteState } from '../types'

const BUTTON_CLASS = 'bg-foreground text-background h-10 w-full rounded-lg text-sm font-medium'

/**
 * 통화 종료 — /call/:callId/end · docs/ia.md 4절
 *
 * 채팅방 번호는 거는 쪽만 안다. 받는 쪽(착신 이벤트에 채팅방 번호가 없다)이나
 * 새로고침으로 들어온 경우에는 홈 버튼만 보인다.
 */
export default function CallEndPage() {
  const navigate = useNavigate()
  const roomId = (useLocation().state as CallEndRouteState | null)?.roomId

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col items-center px-5 pt-12">
      <CallLogo />
      <h1 className="mt-24 text-2xl font-medium">통화 종료</h1>

      <div className="mt-24 flex w-full flex-col gap-6">
        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          className={BUTTON_CLASS}
        >
          홈 화면으로 돌아가기
        </button>
        {roomId !== undefined && (
          <button
            type="button"
            onClick={() => navigate(`/chat/${roomId}`, { replace: true })}
            className={BUTTON_CLASS}
          >
            1:1 채팅방으로 돌아가기
          </button>
        )}
      </div>
    </div>
  )
}
