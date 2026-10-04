import { useState } from 'react'

import { FeedList } from '../components/FeedList'
import { FeedListHeader } from '../components/FeedListHeader'
import { FeedSortSelect } from '../components/FeedSortSelect'
import type { FeedSort } from '../types'

/** 피드 목록 — /people */
export default function FeedListPage() {
  const [sort, setSort] = useState<FeedSort>('LATEST')

  return (
    <div className="mx-auto max-w-md">
      <FeedListHeader />

      <div className="px-4 pt-4 pb-1">
        <FeedSortSelect value={sort} onChange={setSort} />
      </div>

      <FeedList sort={sort} />
    </div>
  )
}
