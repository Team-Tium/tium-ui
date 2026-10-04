/** 채팅 피드백 API 경로와 쿼리 키. */
export const chatFeedbackPaths = {
  feedback: (roomId: number) => `/chats/${roomId}/feedback`,
  recent: '/chats/feedback/recent',
}

export const chatFeedbackKeys = {
  detail: (roomId: number) => ['feedback', 'chat-detail', roomId] as const,
  recent: ['feedback', 'recent-chats'] as const,
}

/** 채팅 피드백 결과 화면 주소. */
export const chatFeedbackHref = (roomId: number) => `/feedback/chat/${roomId}`
