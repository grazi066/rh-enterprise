import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string
  icon: LucideIcon
  colorClassName: string
  hint?: string
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  colorClassName,
  hint,
}: MetricCardProps) {
  return (
    <Card>
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
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-xl font-semibold tracking-tight">
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
