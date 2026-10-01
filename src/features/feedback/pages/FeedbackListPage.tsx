import { useState } from 'react'

import { cn } from '@/shared/lib/utils'
import { RecentCallList } from '../components/RecentCallList'
import type { FeedbackTab } from '../types'

const TABS: { value: FeedbackTab; label: string }[] = [
  { value: 'chat', label: '채팅' },
  { value: 'call', label: '통화' },
]

/** 피드백 목록 (채팅·통화 탭) — /feedback */
export default function FeedbackListPage() {
  const [tab, setTab] = useState<FeedbackTab>('call')

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
        {tab === 'call' ? (
          <RecentCallList />
        ) : (
          <p className="text-muted-foreground p-8 text-center text-sm">
            채팅 피드백은 준비 중이에요
          </p>
        )}
      </div>
    </div>
  )
}
