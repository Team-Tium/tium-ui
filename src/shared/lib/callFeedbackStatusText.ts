import type { CallFeedbackStatus } from '@/shared/api/callFeedback/types'

type StatusInput = {
  /** 서버가 모르는 값을 보낼 수도 있어 문자열로 받는다. */
  status?: string
  mySttSaved?: boolean
  otherSttSaved?: boolean
  /** `FAILED`일 때 실패 코드. */
  failedReason?: string
}

type StatusText = {
  text: string
  /** 피드백 만들기 버튼을 켤 수 있는지. */
  canGenerate: boolean
}

const TEXT: Record<Exclude<CallFeedbackStatus, 'FAILED'>, string> = {
  WAITING_RECORDING: '통화 녹음파일을 기다리는중입니다',
  ANALYZING: '대화 내용을 분석중입니다',
  READY: '대화 내용 분석이 완료되었습니다',
  GENERATING: '피드백을 생성하는 중입니다',
  DONE: '피드백이 완성되었어요',
}

/** 녹음은 분석됐지만 알아들을 수 있는 대화가 없었다. 같은 파일을 다시 올려도 결과가 같다. */
export const NO_SPEECH_REASON = 'FEEDBACK4001'

function failedText(mySttSaved?: boolean, otherSttSaved?: boolean, failedReason?: string): string {
  if (failedReason === NO_SPEECH_REASON) return '대화 내용이 인식되지 않았어요'
  if (mySttSaved === false && otherSttSaved !== false) return '내 녹음 분석에 실패했어요'
  if (otherSttSaved === false && mySttSaved !== false) {
    return '상대방 녹음 분석에 실패했어요. 상대가 다시 올려야 해요'
  }
  return '녹음 분석에 실패했어요'
}

/** 통화 피드백 진행 상태를 화면 문구로 바꾼다. */
export function getCallFeedbackStatusText({
  status,
  mySttSaved,
  otherSttSaved,
  failedReason,
}: StatusInput): StatusText {
  if (status === 'FAILED') {
    return { text: failedText(mySttSaved, otherSttSaved, failedReason), canGenerate: false }
  }
  if (status !== undefined && Object.hasOwn(TEXT, status)) {
    return { text: TEXT[status as keyof typeof TEXT], canGenerate: status === 'READY' }
  }
  return { text: '진행 상태를 확인하지 못했어요', canGenerate: false }
}
