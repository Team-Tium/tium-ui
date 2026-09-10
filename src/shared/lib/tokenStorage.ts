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
} as const

export type Tokens = {
  accessToken: string
  refreshToken: string
}

/** 저장하는 것. 온보딩 완료 여부는 저장하지 않는다 — GET /users/me 가 판정한다. docs/auth_flow.md 7절 */
export type Session = Tokens & {
  memberId: number
}

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(KEY.accessToken),

  getRefreshToken: () => localStorage.getItem(KEY.refreshToken),

  getMemberId: () => {
    const raw = localStorage.getItem(KEY.memberId)
    return raw === null ? null : Number(raw)
  },

  /** 재발급 응답을 저장할 때 쓴다. refresh 도 반드시 새 값으로 덮어쓴다(rotation). */
  saveTokens: ({ accessToken, refreshToken }: Tokens) => {
    localStorage.setItem(KEY.accessToken, accessToken)
    localStorage.setItem(KEY.refreshToken, refreshToken)
  },

  saveSession: (session: Session) => {
    tokenStorage.saveTokens(session)
    localStorage.setItem(KEY.memberId, String(session.memberId))
  },

  clear: () => {
    for (const key of Object.values(KEY)) localStorage.removeItem(key)
  },
}
