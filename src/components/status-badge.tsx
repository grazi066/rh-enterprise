import { Badge } from "@/components/ui/badge"

export type EmployeeStatus =
  | "ativo"
  | "inativo"
  | "em_ferias"
  | "afastado"
  | "desligado"

export type ApprovalStatus = "aprovado" | "reprovado" | "pendente"

export type AppStatus = EmployeeStatus | ApprovalStatus

const STATUS_CONFIG: Record<
  AppStatus,
  { label: string; variant: "success" | "warning" | "info" | "destructive" | "secondary" }
> = {
  ativo: { label: "Ativo", variant: "success" },
  aprovado: { label: "Aprovado", variant: "success" },
  em_ferias: { label: "Em Férias", variant: "warning" },
  pendente: { label: "Pendente", variant: "info" },
  afastado: { label: "Afastado", variant: "secondary" },
  reprovado: { label: "Reprovado", variant: "destructive" },
  inativo: { label: "Inativo", variant: "destructive" },
  desligado: { label: "Desligado", variant: "destructive" },
}

export function StatusBadge({ status }: { status: AppStatus }) {
  const config = STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
