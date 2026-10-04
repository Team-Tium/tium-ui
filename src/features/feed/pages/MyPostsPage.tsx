import { useState } from 'react'

import { FeedHeartListModal } from '../components/FeedHeartListModal'
import { MyPostList } from '../components/MyPostList'
import { MyPostsHeader } from '../components/MyPostsHeader'
import { FeedSortSelect } from '../components/FeedSortSelect'
import type { FeedSort } from '../types'

/** 내 글 목록 — /people/my-posts */
export default function MyPostsPage() {
  const [sort, setSort] = useState<FeedSort>('LATEST')
  // 친구 확인 팝업을 연 글. 닫혀 있으면 null.
  const [heartFeedId, setHeartFeedId] = useState<number | null>(null)

  return (
    <div className="mx-auto max-w-md">
      <MyPostsHeader />

      <div className="px-4 pt-2 pb-1">
        <FeedSortSelect value={sort} onChange={setSort} />
      </div>

      <MyPostList sort={sort} onOpenHearts={setHeartFeedId} />

      <FeedHeartListModal feedId={heartFeedId} onClose={() => setHeartFeedId(null)} />
    </div>
  )
}
