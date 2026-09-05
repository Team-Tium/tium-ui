/**
 * 인증 저장소. 키 목록은 docs/auth_flow.md 6절.
 *
 * 화면 코드에서 직접 부르지 않는다. API 인터셉터와 AuthProvider 만 쓴다.
 * localStorage 를 쓰는 이유와 한계는 docs/architecture.md 3절에 있다.
 */

const KEY = {
  accessToken: 'tium.accessToken',
  refreshToken: 'tium.refreshToken',
  memberId: 'tium.memberId',
  onboardingCompleted: 'tium.onboardingCompleted',
} as const

export type Tokens = {
  accessToken: string
  refreshToken: string
}

export type Session = Tokens & {
  memberId: number
  onboardingCompleted: boolean
}

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(KEY.accessToken),

  getRefreshToken: () => localStorage.getItem(KEY.refreshToken),

  getMemberId: () => {
    const raw = localStorage.getItem(KEY.memberId)
    return raw === null ? null : Number(raw)
  },

  /**
   * 임시 조치다. 값을 사용자가 직접 고칠 수 있어 신뢰할 수 없다.
   * users 명세가 나오면 GET /users/me 로 바꾸고 이 키를 지운다. docs/auth_flow.md 7절
   */
  getOnboardingCompleted: () =>
    localStorage.getItem(KEY.onboardingCompleted) === 'true',

  /** 재발급 응답을 저장할 때 쓴다. refresh 도 반드시 새 값으로 덮어쓴다(rotation). */
  saveTokens: ({ accessToken, refreshToken }: Tokens) => {
    localStorage.setItem(KEY.accessToken, accessToken)
    localStorage.setItem(KEY.refreshToken, refreshToken)
  },

  saveSession: (session: Session) => {
    tokenStorage.saveTokens(session)
    localStorage.setItem(KEY.memberId, String(session.memberId))
    localStorage.setItem(
      KEY.onboardingCompleted,
      String(session.onboardingCompleted),
    )
  },

  setOnboardingCompleted: (completed: boolean) => {
    localStorage.setItem(KEY.onboardingCompleted, String(completed))
  },

  clear: () => {
    for (const key of Object.values(KEY)) localStorage.removeItem(key)
  },
}
