import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string
  icon: LucideIcon
  colorClassName: string
  /** Cor da borda lateral de destaque (ex.: "border-l-success"). Assume border-l-primary quando omitida. */
  accentClassName?: string
  hint?: string
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  colorClassName,
  accentClassName,
  hint,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "border-l-4 shadow-sm transition-all duration-200 hover:shadow-md",
        accentClassName ?? "border-l-primary"
      )}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            colorClassName
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {hint && (
            <p className="truncate text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
