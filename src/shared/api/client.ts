import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

import { tokenStorage } from '@/shared/lib/tokenStorage'
import { ApiError, type ApiResponse } from './types'

const baseURL = import.meta.env.VITE_API_BASE_URL

/**
 * 인터셉터가 붙지 않은 인스턴스.
 * 재발급 호출이 다시 401 처리로 들어가 무한 루프가 되는 것을 막는다.
 */
const plain = axios.create({ baseURL })

const instance = axios.create({ baseURL })

instance.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccessToken()
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

// ── 재발급 ─────────────────────────────────────────────────────────────

let refreshing: Promise<string> | null = null

async function requestNewTokens(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) throw new ApiError('AUTH4012', '리프레시 토큰이 없습니다.')

  const res = await plain.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
    '/auth/reissue',
    { refreshToken },
  )
  const body = res.data
  if (!body.isSuccess) throw new ApiError(body.code, body.message)

  // 백엔드가 rotation 하므로 refresh 도 새 값으로 덮어써야 한다.
  // 안 하면 다음 재발급이 AUTH4012 로 실패한다. docs/auth_api.md 3번
  tokenStorage.saveTokens(body.result)
  return body.result.accessToken
}

/**
 * 재발급은 동시에 한 번만 보낸다.
 *
 * 여러 요청이 같이 401 을 받으면 전부 이 하나의 약속을 기다렸다가 같은 새 토큰으로 재시도한다.
 * 각자 재발급을 보내면 rotation 때문에 먼저 발급된 토큰이 즉시 폐기돼 로그아웃된다.
 * docs/architecture.md 3절이 "AI 가 가장 자주 빠뜨리는 지점"으로 지목한 부분이다.
 */
function refreshOnce(): Promise<string> {
  const pending =
    refreshing ??
    (refreshing = requestNewTokens().finally(() => {
      refreshing = null
    }))
  return pending
}

/**
 * 재발급까지 실패했을 때. 세션이 끝났다는 뜻이다.
 * 라우터가 없는 시점이라 통째로 이동시킨다. 새로고침이 되면서 Query 캐시도 함께 비워진다.
 * STEP 3 에서 라우터가 생기면 navigate 로 바꿔도 된다.
 */
function endSession() {
  tokenStorage.clear()
  if (window.location.pathname !== '/login') window.location.replace('/login')
}

// ── 응답 처리 ──────────────────────────────────────────────────────────

type RetriableConfig = InternalAxiosRequestConfig & { retried?: boolean }

instance.interceptors.response.use(
  (res) => {
    const body = res.data as ApiResponse<unknown>
    if (!body.isSuccess) throw new ApiError(body.code, body.message)
    // 봉투를 여기서 벗긴다. 화면 코드에 result 가 나오면 안 된다.
    return body.result as unknown as AxiosResponse
  },
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined

    if (error.response?.status === 401 && config && !config.retried) {
      config.retried = true
      try {
        const accessToken = await refreshOnce()
        config.headers.Authorization = `Bearer ${accessToken}`
        return await instance.request(config)
      } catch {
        endSession()
        throw new ApiError('AUTH4012', '로그인이 만료되었어요. 다시 로그인해 주세요.')
      }
    }

    const body = error.response?.data as ApiResponse<unknown> | undefined
    if (body && typeof body.code === 'string') {
      throw new ApiError(body.code, body.message)
    }
    throw new ApiError('NETWORK_ERROR', '연결에 실패했어요. 잠시 후 다시 시도해 주세요.')
  },
)

/**
 * 모든 API 호출은 이 객체를 쓴다. 컴포넌트에서 fetch 나 axios 를 직접 부르지 않는다.
 * 반환값은 봉투가 벗겨진 result 다.
 */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => instance.get<T, T>(url, config),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    instance.post<T, T>(url, data, config),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    instance.put<T, T>(url, data, config),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    instance.patch<T, T>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) => instance.delete<T, T>(url, config),
}
