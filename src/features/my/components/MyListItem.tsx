import { Link } from "react-router-dom"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

interface MyListItemProps {
  title: string
  description?: string
  to?: string
  onClick?: () => void
  expandable?: boolean
  expanded?: boolean
}

export function MyListItem({
  title,
  description,
  to,
  onClick,
  expandable,
  expanded,
}: MyListItemProps) {
  const content = (
    <>
      <span className="flex flex-col gap-0.5 text-left">
        {/* Button으로 그려질 때 text-sm을 물려받아 다른 칸보다 작아지므로 크기를 직접 준다 */}
        <span className="text-base font-medium">{title}</span>
        {description && (
          <span className="text-xs font-normal text-muted-foreground">{description}</span>
        )}
      </span>
      {expandable && (expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />)}
    </>
  )
  const className = "flex min-h-[72px] items-center justify-between px-4"

  if (to) {
    return (
      <Link to={to} className={`${className} active:bg-muted/50`}>
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={onClick}
        className={`${className} h-auto w-full justify-between rounded-none`}
      >
        {content}
      </Button>
    )
  }

  return <div className={className}>{content}</div>
}