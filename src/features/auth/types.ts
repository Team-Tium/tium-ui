import type { Gender } from '@/shared/constants/inputconfig'

/** 소셜 제공자. 자체 로그인은 범위에서 빠졌다. docs/auth_api.md */
export type Provider = 'google' | 'kakao' | 'naver'

/** 로그인 화면 버튼 순서. 피그마 Login page 1 (143:701) 기준. */
export const PROVIDERS: readonly Provider[] = ['google', 'kakao', 'naver']

/**
 * `GET /users/me` 와 `POST /onboarding/profile` 이 공통으로 돌려주는 회원 프로필.
 * 봉투(isSuccess/code/message/result)는 인터셉터가 벗긴다. docs/users_api.md §1
 */
export interface MemberProfile {
  memberId: number
  name: string | null
  email: string | null
  address: string | null
  gender: Gender | null
  birthDate: string | null
  introduction: string | null
  onboardingCompleted: boolean
}
