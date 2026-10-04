import { useRef } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { useDeleteFeed } from '../api/useDeleteFeed'

type Props = {
  feedId: number | null
  onClose: () => void
}

/** 내 글 삭제 확인 팝업. 되돌릴 수 없어 한 번 더 묻는다. 삭제되면 닫힌다. */
export function FeedDeleteConfirmModal({ feedId, onClose }: Props) {
  const { mutate: deleteFeed, isPending, isError, reset } = useDeleteFeed()
  // 화면 상태는 한 박자 늦게 바뀌어 연타를 못 막으므로 보낸 중인지 바로 기록한다.
  const sendingRef = useRef(false)

  if (feedId === null) return null

  // 다음에 열 때 지난 실패 안내가 남지 않게 지운다.
  const close = () => {
    reset()
    onClose()
  }

  const confirm = () => {
    if (sendingRef.current) return
    sendingRef.current = true
    deleteFeed(feedId, {
      onSuccess: close,
      onSettled: () => {
        sendingRef.current = false
      },
    })
  }

  return (
    <div className="bg-muted-foreground/60 fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feed-delete-title"
        className="bg-background flex w-5/6 max-w-sm flex-col overflow-hidden rounded-md shadow-2xl"
      >
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <h2 id="feed-delete-title" className="text-md font-medium">
            글 삭제
          </h2>
          <Button variant="ghost" size="icon-sm" aria-label="닫기" disabled={isPending} onClick={close}>
            <X className="text-muted-foreground" />
          </Button>
        </div>

        <div className="flex flex-col items-center gap-6 px-4 py-6">
          <p className="text-center font-medium">이 글을 삭제할까요?</p>
          {isError && (
            <p role="alert" className="text-destructive text-center text-xs">
              삭제하지 못했어요. 잠시 후 다시 시도해 주세요.
            </p>
          )}

          <div className="flex w-full gap-4">
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="flex-1"
              disabled={isPending}
              onClick={close}
            >
              취소
            </Button>
            <Button
              type="button"
              size="lg"
              variant="destructive"
              className="flex-1"
              disabled={isPending}
              onClick={confirm}
            >
              {isPending ? '삭제 중' : '삭제'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
