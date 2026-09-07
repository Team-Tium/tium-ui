/** 소셜 제공자. 자체 로그인은 범위에서 빠졌다. docs/auth_api.md */
export type Provider = 'google' | 'kakao' | 'naver'

/** 로그인 화면 버튼 순서. 피그마 Login page 1 (143:701) 기준. */
export const PROVIDERS: readonly Provider[] = ['google', 'kakao', 'naver']
