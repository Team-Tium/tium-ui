import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '@/shared/components/ui/button'
import { useCreateFeed } from '../api/useCreateFeed'

const schema = z.object({
  content: z.string().trim().min(1, '내용을 입력해 주세요.'),
})

type FeedWriteValues = z.infer<typeof schema>

/** 피드 작성. 등록하면 들어온 화면으로 돌아간다. 피드 목록은 새로 받아 방금 쓴 글이 맨 위에 보인다. */
export function FeedWriteForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { mutate, isPending, isError } = useCreateFeed()

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<FeedWriteValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { content: '' },
  })

  // 직접 주소로 들어오면 돌아갈 기록이 없으니 이 화면을 피드 목록으로 바꾼다.
  const goBack = () =>
    location.key === 'default' ? navigate('/people', { replace: true }) : navigate(-1)

  const onSubmit = ({ content }: FeedWriteValues) => {
    mutate({ content }, { onSuccess: goBack })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <header className="border-border grid grid-cols-[1fr_auto_1fr] items-center border-b px-2 py-2">
        <Button type="button" variant="ghost" size="icon" aria-label="뒤로" onClick={goBack}>
          <ChevronLeft className="size-5" />
        </Button>
        <h1 className="text-lg font-semibold">글쓰기</h1>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="justify-self-end rounded-full px-3"
          disabled={!isValid || isPending}
        >
          {isPending ? '등록 중' : '등록'}
        </Button>
      </header>

      <div className="flex flex-col gap-2 p-6">
        <label htmlFor="feed-content" className="sr-only">
          내용
        </label>
        <textarea
          id="feed-content"
          rows={7}
          placeholder="친구들에게 어필할 내용을 적어보세요"
          className="bg-muted placeholder:text-muted-foreground focus-visible:ring-ring/50 resize-none rounded-2xl p-4 text-sm outline-none focus-visible:ring-3"
          {...register('content')}
        />
        {isError && (
          <p role="alert" className="text-destructive text-xs">
            등록하지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        )}
      </div>
    </form>
  )
}
