import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** 라우트 레벨에서는 탭바를 살려두기 위해 좁은 화면을 넘긴다. */
  fallback?: ReactNode
}

type State = { hasError: boolean }

/**
 * 흰 화면 대신 무엇이라도 보여준다. docs/architecture.md 6-2
 * 앱 최상단에 1개, 라우트 레벨에 1개 둔다.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO: Sentry 를 붙이면 여기서 보고한다. docs/architecture.md 6-3
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    if (this.props.fallback) return this.props.fallback

    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="font-medium">문제가 생겼어요</p>
        <p className="text-muted-foreground text-sm">
          잠시 후 다시 시도해 주세요.
        </p>
        <button
          type="button"
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm"
          onClick={() => window.location.reload()}
        >
          새로고침
        </button>
      </div>
    )
  }
}
