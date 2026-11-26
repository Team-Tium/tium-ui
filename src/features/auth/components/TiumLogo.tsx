/**
 * Tium 글자 로고. i의 점을 주황 동그라미로 바꿔 "틔움"의 싹을 나타낸다.
 * 점 없는 ı(U+0131) 위에 점을 따로 얹는다. 글자색은 부모의 color를 따른다.
 */
export function TiumLogo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline font-extrabold tracking-tight ${className ?? ''}`}>
      t
      <span className="relative">
        ı
        <span className="bg-accent absolute top-[0.08em] left-1/2 size-[0.2em] -translate-x-1/2 rounded-full" />
      </span>
      um
    </span>
  )
}
