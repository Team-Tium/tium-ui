import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

import { ListState } from '@/shared/components/ListState'
import { useCallOpponent } from '../api/useCallOpponent'
import { useStartCall } from '../api/useStartCall'
import { getMicrophone, releaseStream } from '../lib/peerConnection'
import type { VoiceCallWaitingRouteState } from '../types'

/**
 * 음성 통화 준비 — /call/voice/:roomId/ready · docs/ia.md 4절
 *
 * 시작 메시지 추천 목록 자리는 비워 둔다. 추천 API가 아직 배포되지 않았다.
 * 마이크 권한은 시작 버튼을 누를 때 묻는다.
 */
export default function VoiceCallReadyPage() {
  const navigate = useNavigate()
  const roomId = Number(useParams().roomId)
  const { data: opponent, isPending, isError } = useCallOpponent(roomId)
  const startCall = useStartCall()
  const [error, setError] = useState<string | null>(null)
  const [checkingMic, setCheckingMic] = useState(false)

  async function handleStart() {
    if (!opponent) return
    setError(null)

    // 권한만 확인하고 바로 놓는다. 실제 연결은 통화 중 화면에서 다시 잡는다.
    setCheckingMic(true)
    try {
      releaseStream(await getMicrophone())
    } catch {
      setError('마이크 권한을 허용해야 통화할 수 있어요.')
      return
    } finally {
      setCheckingMic(false)
    }

    startCall.mutate(
      { type: 'VOICE', participantIds: [opponent.userId] },
      {
        onSuccess: (call) => {
          if (call.callId === undefined) {
            setError('통화를 시작하지 못했어요. 잠시 후 다시 시도해 주세요.')
            return
          }
          const state: VoiceCallWaitingRouteState = {
            callId: call.callId,
            opponentName: opponent.nickname,
          }
          navigate(`/call/voice/${roomId}/waiting`, { replace: true, state })
        },
        // "상대가 통화 중" 전용 에러 코드가 아직 없어 한 문구로 안내한다.
        onError: () => setError('통화를 걸 수 없어요. 상대가 통화 중일 수 있어요.'),
      },
    )
  }

  const busy = checkingMic || startCall.isPending

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col">
      <header className="relative flex h-14 items-center justify-center px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="absolute left-2 flex size-10 items-center justify-center"
        >
          <ChevronLeft className="size-6" aria-hidden />
        </button>
        <h1 className="text-lg font-semibold">음성 통화 준비</h1>
      </header>

      <main className="flex-1 px-5 py-4">
        <ListState
          isLoading={isPending}
          isError={isError || (!isPending && !opponent)}
          isEmpty={false}
          errorText="통화 상대를 불러오지 못했어요."
        >
          <h2 className="font-semibold">시작 메시지 추천</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {opponent?.nickname}님과 대화를 시작할 때 써 보세요.
          </p>
          <div className="text-muted-foreground mt-4 rounded-xl bg-card p-6 text-center text-sm">
            추천 메시지를 준비하고 있어요.
          </div>
        </ListState>
      </main>

      <footer className="px-5 pb-8">
        {error && <p className="text-destructive mb-3 text-center text-sm">{error}</p>}
        <button
          type="button"
          onClick={handleStart}
          disabled={!opponent || busy}
          className="bg-foreground text-background h-14 w-full rounded-xl font-semibold disabled:opacity-50"
        >
          {busy ? '연결하는 중...' : '음성 통화 시작'}
        </button>
      </footer>
    </div>
  )
}
