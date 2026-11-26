import type { ReactNode } from "react"
import { AlertCircle, Inbox, Loader2 } from "lucide-react"

interface ListStateProps {
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  loadingText?: string
  errorText?: string
  emptyText?: string
  children: ReactNode
}

/**
 * 목록·상세 화면의 로딩 / 빈 데이터 / 에러 3종 공용 처리.
 * docs/architecture.md 6-1
 */
export function ListState({
  isLoading,
  isError,
  isEmpty,
  loadingText = "불러오는 중...",
  errorText = "목록을 불러오지 못했어요.",
  emptyText = "표시할 내용이 없어요.",
  children,
}: ListStateProps) {
  if (isLoading) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 px-6 py-16">
        <Loader2 className="text-primary size-7 animate-spin" />
        <p className="text-caption text-muted-foreground">{loadingText}</p>
      </div>
    )
  }
  if (isError) {
    return (
      <StateMessage icon={<AlertCircle />} iconClassName="bg-destructive/10 text-destructive">
        {errorText}
      </StateMessage>
    )
  }
  if (isEmpty) {
    return (
      <StateMessage icon={<Inbox />} iconClassName="bg-secondary text-primary">
        {emptyText}
      </StateMessage>
    )
  }
  return <>{children}</>
}

/** 동그란 아이콘 + 문구. 빈 화면과 에러 화면이 같이 쓴다. */
function StateMessage({
  icon,
  iconClassName,
  children,
}: {
  icon: ReactNode
  iconClassName: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className={`grid size-14 place-items-center rounded-full [&_svg]:size-7 ${iconClassName}`}>
        {icon}
      </div>
      <p className="text-body font-medium">{children}</p>
    </div>
  )
}
