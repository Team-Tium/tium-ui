/** 백엔드가 항상 씌워 보내는 응답 봉투. 화면 코드는 이 타입을 볼 일이 없다. */
export type ApiResponse<T> = {
  isSuccess: boolean
  code: string
  message: string
  result: T
}

/**
 * 봉투의 isSuccess 가 false 일 때 던지는 에러.
 * 화면에서는 try/catch 나 Query 의 error 로만 다룬다.
 */
export class ApiError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

/** 인증 도메인 에러(AUTH****)는 재시도하지 않는다. docs/architecture.md 4절 */
export function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && error.code.startsWith('AUTH')
}
