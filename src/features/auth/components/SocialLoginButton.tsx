import { buildAuthorizeUrl } from '../oauth'
import type { Provider } from '../types'
import { BrandIcon } from './BrandIcon'

/**
 * 외부 브랜드 색이다. index.css 토큰이 아니다 — 구글·카카오·네이버가 각자 고정한 값이라
 * 우리 팔레트에 넣지 않는다. (CLAUDE.md「색상 값을 하드코딩하지 않는다」의 예외: 소셜 버튼)
 * 각 사 로그인 버튼 가이드의 바탕색·글자색을 따른다.
 */
const BRAND: Record<Provider, { label: string; className: string }> = {
  google: { label: 'Google', className: 'border-[#DADCE0] bg-white text-[#1F1F1F]' },
  kakao: { label: '카카오', className: 'border-transparent bg-[#FEE500] text-black/85' },
  naver: { label: '네이버', className: 'border-transparent bg-[#03C75A] text-white' },
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
      className={`text-body relative flex h-14 w-full items-center justify-center rounded-2xl border font-semibold transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] ${className}`}
    >
      <BrandIcon provider={provider} className="absolute left-5 size-5" />
      {label}로 시작하기
    </button>
  )
}
