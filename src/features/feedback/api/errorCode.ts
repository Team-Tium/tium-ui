import { ApiError, isAuthError } from '@/shared/api/types'

/** 서버 에러 코드. 서버 에러가 아니면 undefined. */
export function errorCode(error: unknown): string | undefined {
  return error instanceof ApiError ? error.code : undefined
}

/** 기본 재시도 정책(인증 에러 제외 1회)에 더해 codes 에러도 재시도하지 않는다. */
export function retryExcept(...codes: string[]) {
  return (failureCount: number, error: Error) => {
    const code = errorCode(error)
    return !isAuthError(error) && !(code && codes.includes(code)) && failureCount < 1
  }
}
