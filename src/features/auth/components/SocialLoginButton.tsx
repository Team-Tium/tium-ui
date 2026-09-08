import { buildAuthorizeUrl } from '../oauth'
import type { Provider } from '../types'
import { BrandIcon } from './BrandIcon'

/**
 * 외부 브랜드 색이다. index.css 토큰이 아니다 — 구글·카카오·네이버가 각자 고정한 값이라
 * 우리 팔레트에 넣지 않는다. (CLAUDE.md「색상 값을 하드코딩하지 않는다」의 예외: 소셜 버튼)
 * 값은 피그마 Login page 1 (143:701)의 테두리 색.
 */
const BRAND: Record<Provider, { label: string; className: string }> = {
  google: { label: 'Google', className: 'border-[#4285F4] text-[#4285F4]' },
  kakao: { label: 'Kakao', className: 'border-[#FFCD00] text-[#FFCD00]' },
  naver: { label: 'Naver', className: 'border-[#2FB14A] text-[#2FB14A]' },
}

/**
 * 소셜 로그인 버튼 1개. 누르면 provider 인가 페이지로 페이지째 이동한다.
 * 로딩·에러 상태는 없다 — 이동만 하므로. docs/auth_flow.md 2·5절
 */
export function SocialLoginButton({ provider }: { provider: Provider }) {
  const { label, className } = BRAND[provider]

  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = buildAuthorizeUrl(provider)
      }}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-full border bg-background text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none ${className}`}
    >
      <BrandIcon provider={provider} className="size-5" />
      {label}로 로그인하기
    </button>
  )
}
