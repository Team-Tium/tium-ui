import { Suspense } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { MessageCircle, Sparkles, User, Users } from 'lucide-react'

import { ErrorBoundary } from '@/app/providers/ErrorBoundary'
import { cn } from '@/shared/lib/utils'

/** 탭 4개. docs/ia.md 「탭 구조」 */
const TABS = [
  { to: '/', label: '채팅', Icon: MessageCircle },
  { to: '/people', label: '사람들', Icon: Users },
  { to: '/feedback', label: '피드백', Icon: Sparkles },
  { to: '/my', label: '마이', Icon: User },
]

export default function TabBarLayout() {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-svh flex-col">
      <main className="flex-1 pb-16">
        {/* 라우트 레벨 경계. 화면 하나가 터져도 아래 탭바는 살아 있다.
            key 를 주소로 두어 다른 화면으로 옮기면 다시 시도된다. */}
        <ErrorBoundary
          key={pathname}
          fallback={
            <div className="space-y-2 p-6 text-center">
              <p className="font-medium">이 화면을 불러오지 못했어요</p>
              <p className="text-muted-foreground text-sm">
                다른 탭으로 이동했다가 다시 들어와 주세요.
              </p>
            </div>
          }
        >
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <nav className="bg-card border-border fixed inset-x-0 bottom-0 z-10 mx-auto flex h-16 max-w-md border-t">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-xs',
                isActive ? 'text-primary font-medium' : 'text-muted-foreground',
              )
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
