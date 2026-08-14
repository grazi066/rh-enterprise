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
  /** Sobrepõe fundo/borda do Card (ex.: tema colorido por card). O cn()
   * usa tailwind-merge, então classes de bg e border aqui substituem os
   * padrões (bg-card/70, border-border) em vez de colidir com eles. */
  className?: string
  /** Sobrepõe a cor do texto do valor, acompanhando o tema do card. */
  valueClassName?: string
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  highlight,
  hint,
  className,
  valueClassName,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "bg-card/70 shadow-sm backdrop-blur-md",
        highlight && "border-l-[3px] border-l-accent-600",
        className
      )}
    >
      <CardContent className="min-h-28 p-4">
        <div className="flex items-start gap-1.5">
          {Icon && <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />}
          {/* Sem truncate: rótulos longos (ex. "Folha Salarial Total
              Mensal") quebram em duas linhas em vez de cortar com "...". */}
          <p className="text-xs font-semibold tracking-wider whitespace-normal text-muted-foreground uppercase">
            {label}
          </p>
        </div>
        {/* Valores financeiros grandes (ex.: "R$ 109.850,00") podem não
            caber no espaço do card — o Tooltip garante que o valor completo
            continue acessível mesmo truncado. */}
        <Tooltip>
          <TooltipTrigger
            render={
              <p
                className={cn(
                  "mt-1.5 truncate text-lg font-bold sm:text-xl",
                  valueClassName ?? "text-foreground"
                )}
              >
                {value}
              </p>
            }
          />
          <TooltipContent>{value}</TooltipContent>
        </Tooltip>
        {hint && (
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
