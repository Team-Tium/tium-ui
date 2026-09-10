import { LoaderCircle } from 'lucide-react'

/**
 * 라우트 가드가 서버 응답을 기다리는 동안 보여주는 스피너.
 *
 * 지금 쓰는 곳은 `app/router/guards.tsx` 의 `RequireOnboarding` 하나뿐이다 —
 * `GET /users/me` 를 기다리는 동안. docs/auth_flow.md 7절
 *
 * **버릴 때**: 이 파일을 지우고 `guards.tsx` 의 import 한 줄과 사용처만 지우면 끝난다.
 * 다른 데서 쓰기 시작하면 이 주석부터 고칠 것.
 */
export function RouteFallback({ label = '불러오는 중이에요' }: { label?: string }) {
  return (
    <div className="flex min-h-svh items-center justify-center" role="status" aria-live="polite">
      <LoaderCircle className="text-primary size-8 animate-spin" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
