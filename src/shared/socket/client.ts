import { Client, type StompSubscription } from '@stomp/stompjs'

import { refreshAccessToken } from '@/shared/api/client'
import { tokenStorage } from '@/shared/lib/tokenStorage'
import { parseSocketEvent, type SocketEvent } from './events'

type Handler = (event: SocketEvent) => void

const brokerURL = import.meta.env.VITE_WS_BASE_URL

/** 토큰이 만료돼 연결이 끊겼을 때 서버가 보내는 값. */
const EXPIRED_TOKEN = 'AUTH4011'

/** 주소마다 듣고 있는 화면들. 한 주소를 여러 화면이 같이 들을 수 있다. */
const handlers = new Map<string, Set<Handler>>()

/** 주소마다 서버에 실제로 걸어둔 구독. 주소 하나당 하나만 건다. */
const subscriptions = new Map<string, StompSubscription>()

let client: Client | null = null

/** 다음 연결 시도 전에 토큰을 새로 받아야 하는지. */
let needsFreshToken = false

function deliver(destination: string, body: string) {
  const event = parseSocketEvent(body)
  if (!event) return
  for (const handler of handlers.get(destination) ?? []) handler(event)
}

function openSubscription(destination: string) {
  if (!client?.connected || subscriptions.has(destination)) return
  const subscription = client.subscribe(destination, (message) => {
    deliver(destination, message.body)
  })
  subscriptions.set(destination, subscription)
}

function createClient() {
  const stomp = new Client({
    brokerURL,
    // 끊긴 것을 서로 빨리 알아채기 위해 양방향으로 보낸다.
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,
    // 지하철·화면 잠금 등으로 끊기면 알아서 다시 붙는다.
    reconnectDelay: 3_000,
  })

  // 연결할 때마다 토큰을 새로 읽는다. 재연결 사이에 토큰이 바뀌었을 수 있다.
  stomp.beforeConnect = async () => {
    if (needsFreshToken) {
      needsFreshToken = false
      try {
        await refreshAccessToken()
      } catch {
        // 재발급까지 실패하면 다시 로그인해야 한다. 그 처리는 API 쪽이 이미 한다.
        stomp.deactivate()
        return
      }
    }
    const accessToken = tokenStorage.getAccessToken()
    stomp.connectHeaders = accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
  }

  // 연결이 새로 열릴 때마다 듣고 있던 주소를 전부 다시 건다.
  // 끊기면 서버 쪽 구독은 사라지기 때문에, 다시 걸지 않으면 조용히 아무것도 안 온다.
  stomp.onConnect = () => {
    subscriptions.clear()
    for (const destination of handlers.keys()) openSubscription(destination)
  }

  stomp.onStompError = (frame) => {
    if (frame.headers.message?.includes(EXPIRED_TOKEN)) needsFreshToken = true
  }

  stomp.onWebSocketClose = () => {
    subscriptions.clear()
  }

  return stomp
}

export const socketClient = {
  /** 로그인한 뒤 한 번 부른다. 앱 전체에 연결은 하나뿐이다. */
  connect() {
    if (client) return
    client = createClient()
    client.activate()
  },

  /** 로그아웃할 때 부른다. 듣고 있던 주소도 모두 정리한다. */
  disconnect() {
    handlers.clear()
    subscriptions.clear()
    needsFreshToken = false
    void client?.deactivate()
    client = null
  },

  /**
   * 주소를 듣기 시작한다. 돌려주는 함수를 부르면 그만 듣는다.
   * 아직 연결 전이어도 부를 수 있다. 연결되면 자동으로 걸린다.
   */
  subscribe(destination: string, handler: Handler) {
    const listeners = handlers.get(destination) ?? new Set<Handler>()
    listeners.add(handler)
    handlers.set(destination, listeners)
    openSubscription(destination)

    return () => {
      listeners.delete(handler)
      if (listeners.size > 0) return
      handlers.delete(destination)
      subscriptions.get(destination)?.unsubscribe()
      subscriptions.delete(destination)
    }
  },

  /** 서버로 보낸다. 연결이 끊겨 있으면 보내지 않고 false 를 준다. */
  publish(destination: string, body?: unknown) {
    if (!client?.connected) return false
    client.publish({ destination, body: body === undefined ? '' : JSON.stringify(body) })
    return true
  },
}
