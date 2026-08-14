import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string
  icon?: LucideIcon
  /** Marca este como o card mais importante da tela — único a ganhar
   * destaque na borda esquerda. Os demais cards da mesma grade ficam neutros. */
  highlight?: boolean
  hint?: string
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  highlight,
  hint,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "bg-card/70 shadow-sm backdrop-blur-md",
        highlight && "border-l-[3px] border-l-accent-600"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="size-4 shrink-0 text-slate-400" />}
          <p className="truncate text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {label}
          </p>
        </div>
        {/* Valores financeiros grandes (ex.: "R$ 109.850,00") podem não
            caber no espaço do card — o Tooltip garante que o valor completo
            continue acessível mesmo truncado. */}
        <Tooltip>
          <TooltipTrigger
            render={
              <p className="mt-1.5 truncate text-2xl font-semibold text-foreground">
                {value}
              </p>
            }
          />
          <TooltipContent>{value}</TooltipContent>
        </Tooltip>
        {hint && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>
        )}
      </CardContent>
    </Card>
  )
}
