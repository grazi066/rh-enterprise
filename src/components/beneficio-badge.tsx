import type { LucideIcon } from "lucide-react"
import {
  Bus,
  Dumbbell,
  HeartPulse,
  PiggyBank,
  ShieldCheck,
  Smile,
  Ticket,
  UtensilsCrossed,
} from "lucide-react"

import type { TipoBeneficio } from "@/generated/prisma/client"
import { cn } from "@/lib/utils"

interface TipoBeneficioConfig {
  label: string
  labelCurto: string
  icon: LucideIcon
  className: string
}

// Paleta própria (fora do trio verde/âmbar/azul reservado a status de fluxo
// — ver CLAUDE.md "Design System"): cada tipo de benefício tem uma cor fixa
// para virar reconhecível de relance nos cards e badges.
export const TIPO_BENEFICIO_CONFIG: Record<TipoBeneficio, TipoBeneficioConfig> = {
  SAUDE: {
    label: "Plano de Saúde",
    labelCurto: "Saúde",
    icon: HeartPulse,
    className: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  },
  ODONTOLOGICO: {
    label: "Odontológico",
    labelCurto: "Odonto",
    icon: Smile,
    className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400",
  },
  VALE_REFEICAO: {
    label: "Vale Refeição",
    labelCurto: "VR",
    icon: UtensilsCrossed,
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  },
  VALE_TRANSPORTE: {
    label: "Vale Transporte",
    labelCurto: "VT",
    icon: Bus,
    className: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  },
  PREVIDENCIA_PRIVADA: {
    label: "Previdência Privada",
    labelCurto: "Previdência",
    icon: PiggyBank,
    className:
      "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  },
  SEGURO_DE_VIDA: {
    label: "Seguro de Vida",
    labelCurto: "Seguro",
    icon: ShieldCheck,
    className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  },
  GYMPASS: {
    label: "Gympass",
    labelCurto: "Gympass",
    icon: Dumbbell,
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  VALE_CULTURA: {
    label: "Vale Cultura",
    labelCurto: "Vale Cultura",
    icon: Ticket,
    className:
      "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-400",
  },
}

export function BeneficioTipoBadge({
  tipo,
  className,
}: {
  tipo: TipoBeneficio
  className?: string
}) {
  const config = TIPO_BENEFICIO_CONFIG[tipo]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center gap-1 rounded-4xl px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        config.className,
        className
      )}
    >
      <Icon className="size-3" />
      {config.labelCurto}
    </span>
  )
}
