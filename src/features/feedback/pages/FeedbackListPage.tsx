import { useSearchParams } from 'react-router-dom'

import { cn } from '@/shared/lib/utils'
import { RecentCallList } from '../components/RecentCallList'
import { RecentChatList } from '../components/RecentChatList'
import type { FeedbackTab } from '../types'

const TABS: { value: FeedbackTab; label: string }[] = [
  { value: 'chat', label: '채팅' },
  { value: 'call', label: '통화' },
]

/**
 * 피드백 목록 (채팅·통화 탭) — /feedback
 *
 * 탭은 주소(?tab=chat)에 둔다. 결과 화면에서 돌아와도 보던 탭이 유지된다. 없으면 통화 탭이다.
 */
export default function FeedbackListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: FeedbackTab = searchParams.get('tab') === 'chat' ? 'chat' : 'call'
  const setTab = (value: FeedbackTab) => setSearchParams({ tab: value }, { replace: true })

  return (
    <div className="mx-auto max-w-md">
      <h1 className="px-4 py-3 text-lg font-semibold">피드백</h1>

      <div role="tablist" className="border-border flex border-b">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              '-mb-px flex-1 border-b-2 py-2.5 text-sm',
              tab === value
                ? 'border-primary text-primary font-medium'
                : 'text-muted-foreground border-transparent',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'call' ? <RecentCallList /> : <RecentChatList />}
      </div>
    </div>
  )
}
