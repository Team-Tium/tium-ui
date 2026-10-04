import { ChevronDown } from 'lucide-react'

import type { FeedSort } from '../types'

const OPTIONS: { value: FeedSort; label: string }[] = [
  { value: 'LATEST', label: '최신순' },
  { value: 'HEART', label: '하트순' },
]

type Props = {
  value: FeedSort
  onChange: (sort: FeedSort) => void
}

/** 피드 정렬 선택. 브라우저 기본 선택 창을 칩 모양으로 감쌌다. */
export function FeedSortSelect({ value, onChange }: Props) {
  return (
    <label className="border-foreground relative inline-flex items-center rounded-full border">
      <span className="sr-only">정렬</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as FeedSort)}
        className="appearance-none bg-transparent py-1 pr-7 pl-3 text-xs outline-none"
      >
        {OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 size-3" />
    </label>
  )
}
