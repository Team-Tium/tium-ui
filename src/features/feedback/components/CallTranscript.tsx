import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { ListState } from '@/shared/components/ListState'
import { cn } from '@/shared/lib/utils'
import { errorCode } from '../api/errorCode'
import { useCallTranscript } from '../api/useCallTranscript'
import { formatClock } from '../lib/formatTime'
import type { TranscriptSegment } from '../types'

/** 서버 시각은 전화를 건 순간이 0이다. 첫 문장을 0초로 맞춘다. */
function firstStartMs(segments: TranscriptSegment[]): number {
  const starts = segments.map((s) => s.startMs).filter((ms): ms is number => typeof ms === 'number')
  return starts.length > 0 ? Math.min(...starts) : 0
}

type Props = {
  callId: number
  opponentName?: string
}

/** 결과 화면 아래 대화 내용. 펼칠 때 처음 불러온다. */
export function CallTranscript({ callId, opponentName }: Props) {
  const [expanded, setExpanded] = useState(false)
  const transcript = useCallTranscript(callId, { enabled: expanded })

  const notFound = errorCode(transcript.error) === 'CALL_STT4041'
  const segments = (transcript.data?.segments ?? []).filter((s) => s.text?.trim())
  const base = firstStartMs(segments)

  return (
    <section className="bg-card flex flex-col rounded-xl">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between p-4 text-sm font-semibold"
      >
        대화 내용
        <ChevronDown
          className={cn('text-muted-foreground size-4 transition-transform', expanded && 'rotate-180')}
        />
      </button>

      {expanded && (
        <div className="border-border border-t">
          <ListState
            isLoading={transcript.isPending}
            isError={transcript.isError && !notFound}
            isEmpty={notFound || segments.length === 0}
            loadingText="대화 내용을 불러오는 중이에요"
            errorText="대화 내용을 불러오지 못했어요"
            emptyText="표시할 대화 내용이 없어요"
          >
            <ol className="flex flex-col gap-3 p-4">
              {segments.map((segment, index) => {
                const isMe = segment.speaker === 'ME'
                return (
                  <li
                    key={index}
                    className={cn('flex flex-col gap-1', isMe ? 'items-end' : 'items-start')}
                  >
                    <span className="text-muted-foreground text-xs">
                      {isMe ? '나' : (opponentName ?? '상대방')}
                      {typeof segment.startMs === 'number' &&
                        ` · ${formatClock((segment.startMs - base) / 1000)}`}
                    </span>
                    <p
                      className={cn(
                        'max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed',
                        isMe ? 'bg-secondary text-secondary-foreground' : 'bg-background',
                      )}
                    >
                      {segment.text}
                    </p>
                  </li>
                )
              })}
            </ol>
          </ListState>
        </div>
      )}
    </section>
  )
}
