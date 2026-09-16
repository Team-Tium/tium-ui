import type { ReactNode } from "react"

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
    return <div className="p-8 text-center text-sm text-muted-foreground">{loadingText}</div>
  }
  if (isError) {
    return <div className="p-8 text-center text-sm text-muted-foreground">{errorText}</div>
  }
  if (isEmpty) {
    return <div className="p-8 text-center text-sm text-muted-foreground">{emptyText}</div>
  }
  return <>{children}</>
}