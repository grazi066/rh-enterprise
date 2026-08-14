import type { LucideIcon } from "lucide-react"
import {
  Banknote,
  Briefcase,
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  FilePlus,
  FileText,
  ToggleLeft,
  UserCog,
  UserMinus,
  UserPlus,
  Wallet,
  XCircle,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface AcaoAuditoriaConfig {
  label: string
  icon: LucideIcon
  className: string
}

// Paleta própria para ações de auditoria (mesmo espírito de
// beneficio-badge.tsx: taxonomia sem workflow, fora do trio verde/âmbar/azul
// reservado a status de fluxo — ver CLAUDE.md "Design System"), com uma
// exceção deliberada: ações de criação/aprovação/rejeição usam esse trio
// (azul/verde/vermelho) porque elas *são* o resultado de um fluxo de
// aprovação, e a cor precisa comunicar isso à primeira vista.
const ACAO_AUDITORIA_CONFIG: Record<string, AcaoAuditoriaConfig> = {
  CRIACAO_SOLICITACAO: {
    label: "Criação de Solicitação",
    icon: FilePlus,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  },
  APROVACAO_SOLICITACAO: {
    label: "Aprovação de Solicitação",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  },
  REJEICAO_SOLICITACAO: {
    label: "Rejeição de Solicitação",
    icon: XCircle,
    className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  },
  CRIACAO_COLABORADOR: {
    label: "Criação de Colaborador",
    icon: UserPlus,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  },
  EXCLUSAO_COLABORADOR: {
    label: "Exclusão de Colaborador",
    icon: UserMinus,
    className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  },
  CRIACAO_CARGO: {
    label: "Criação de Cargo",
    icon: Briefcase,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  },
  ALTERACAO_SALARIO: {
    label: "Alteração de Salário",
    icon: Wallet,
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  ALTERACAO_CARGO: {
    label: "Alteração de Cargo",
    icon: UserCog,
    className: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  },
  ALTERACAO_STATUS: {
    label: "Alteração de Status",
    icon: ToggleLeft,
    className: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  },
  APROVACAO_FERIAS: {
    label: "Aprovação de Férias",
    icon: CalendarCheck,
    className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400",
  },
  CANCELAMENTO_FERIAS: {
    label: "Cancelamento de Férias",
    icon: CalendarX,
    className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  },
  PAGAMENTO_FOLHA: {
    label: "Pagamento de Folha",
    icon: Banknote,
    className: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  },
}

const FALLBACK_CONFIG: AcaoAuditoriaConfig = {
  label: "",
  icon: FileText,
  className: "bg-muted text-muted-foreground",
}

export function acaoAuditoriaLabel(acao: string) {
  return ACAO_AUDITORIA_CONFIG[acao]?.label ?? acao
}

export function AcaoAuditoriaBadge({ acao, className }: { acao: string; className?: string }) {
  const config = ACAO_AUDITORIA_CONFIG[acao] ?? { ...FALLBACK_CONFIG, label: acao }
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
      {config.label}
    </span>
  )
}
