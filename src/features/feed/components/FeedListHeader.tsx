import { SquarePen } from 'lucide-react'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

/** 사람들 탭 위쪽의 하위 메뉴. 피드가 지금 화면이다. */
const SECTIONS = [
  { to: '/people', label: '피드' },
  { to: '/random/video/waiting', label: '영상통화 대기방' },
  { to: '/random', label: '랜덤 대화' },
]

/** 피드 목록 위쪽. 제목, 내 글 바로가기, 하위 메뉴. */
export function FeedListHeader() {
  return (
    <>
      <header className="flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold">사람들</h1>
        <Link
          to="/people/my-posts"
          aria-label="내 글"
          className={buttonVariants({ variant: 'ghost', size: 'icon' })}
        >
          <SquarePen className="size-5" />
        </Link>
      </header>

      <nav className="grid grid-cols-3 gap-2 px-4">
        {SECTIONS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            aria-current={to === '/people' ? 'page' : undefined}
            className={cn(
              'border-foreground rounded-full border py-1.5 text-center text-xs font-medium',
              to === '/people' && 'bg-foreground text-background',
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </>
  )
}
