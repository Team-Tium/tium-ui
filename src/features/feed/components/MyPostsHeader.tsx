import { ChevronLeft, Plus } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Button, buttonVariants } from '@/shared/components/ui/button'

/** 내 글 목록 위쪽. 뒤로, 제목, 글쓰기. */
export function MyPostsHeader() {
  const navigate = useNavigate()
  const location = useLocation()

  // 직접 주소로 들어오면 돌아갈 기록이 없다.
  const goBack = () => (location.key === 'default' ? navigate('/people') : navigate(-1))

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center px-2 py-2">
      <Button variant="ghost" size="icon" aria-label="뒤로" onClick={goBack}>
        <ChevronLeft className="size-5" />
      </Button>
      <h1 className="text-lg font-semibold">내 글</h1>
      <Link
        to="/people/new"
        aria-label="글쓰기"
        className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'justify-self-end' })}
      >
        <Plus className="size-5" />
      </Link>
    </header>
  )
}
