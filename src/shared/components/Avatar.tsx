import { useState } from "react"
import { UserRound } from "lucide-react"

import { cn } from "@/shared/lib/utils"

interface AvatarProps {
  /** 프로필 사진 주소. 없거나 비었거나 불러오기에 실패하면 기본 사람 아이콘을 그린다 */
  src?: string | null
  /** 사진 설명. 옆에 이름이 같이 보이면 비워 둔다 */
  alt?: string
  /** 지름(px) */
  size: number
  className?: string
}

/**
 * 동그란 프로필 사진. 사진이 없으면 카카오톡 기본 프로필처럼
 * 회녹색 바탕에 흰 사람 실루엣을 아래쪽에 붙여 그린다.
 */
export function Avatar({ src, alt = "", size, className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const hasImage = Boolean(src) && src !== failedSrc

  return (
    <span
      className={cn(
        "bg-muted-foreground/40 relative inline-flex shrink-0 items-end justify-center overflow-hidden rounded-full",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {hasImage ? (
        <img
          src={src!}
          alt={alt}
          loading="lazy"
          width={size}
          height={size}
          onError={() => setFailedSrc(src!)}
          className="size-full object-cover"
        />
      ) : (
        <UserRound
          role={alt ? "img" : undefined}
          aria-label={alt || undefined}
          aria-hidden={alt ? undefined : true}
          fill="currentColor"
          strokeWidth={0}
          className="text-primary-foreground size-[115%] max-w-none translate-y-[8%]"
        />
      )}
    </span>
  )
}
