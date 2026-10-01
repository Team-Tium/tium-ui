import type { ReactNode } from 'react'

import type { CallFeedbackResponse } from '@/shared/api/callFeedback/types'

/** 통화·채팅 피드백 본문 모양이 같아 통화 별칭을 그대로 쓴다. */
type FeedbackBody = CallFeedbackResponse

const QUALITY_TEXT: Record<string, string> = {
  GOOD: '좋아요',
  AMBIGUOUS: '더 좋아질 수 있어요',
  BAD: '연습이 필요해요',
}

const EMPTY_TEXT = '표시할 내용이 없어요'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-card flex flex-col gap-2 rounded-xl p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Paragraph({ text }: { text?: string }) {
  const value = text?.trim()
  return value ? (
    <p className="text-sm leading-relaxed whitespace-pre-line">{value}</p>
  ) : (
    <p className="text-muted-foreground text-sm">{EMPTY_TEXT}</p>
  )
}

function Bullets({ items }: { items?: string[] }) {
  const values = (items ?? []).map((item) => item.trim()).filter(Boolean)
  if (values.length === 0) return <p className="text-muted-foreground text-sm">{EMPTY_TEXT}</p>
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed">
      {values.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  )
}

type Props = {
  feedback: FeedbackBody
}

/** 피드백 결과 본문. 총평 → 잘한 점 → 아쉬운 점 → 다음 연습 → 대화 주제. */
export function FeedbackResult({ feedback }: Props) {
  const value = feedback.overallQuality
  const quality = value && Object.hasOwn(QUALITY_TEXT, value) ? QUALITY_TEXT[value] : undefined

  return (
    <div className="flex flex-col gap-3">
      <Section title="총평">
        {quality && (
          <span className="bg-secondary text-secondary-foreground self-start rounded-full px-2.5 py-0.5 text-xs font-medium">
            {quality}
          </span>
        )}
        <Paragraph text={feedback.overallFeedback} />
      </Section>
      <Section title="잘한 점">
        <Bullets items={feedback.strength} />
      </Section>
      <Section title="아쉬운 점">
        <Bullets items={feedback.flowProblem} />
      </Section>
      <Section title="다음 연습">
        <Paragraph text={feedback.practicePoint} />
      </Section>
      <Section title="대화 주제">
        <Bullets items={feedback.conversationPoints} />
      </Section>
    </div>
  )
}
