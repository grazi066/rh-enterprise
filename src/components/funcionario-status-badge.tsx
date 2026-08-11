import { Badge } from "@/components/ui/badge"
import type { StatusFuncionario } from "@/generated/prisma/enums"

const FUNCIONARIO_STATUS_CONFIG: Record<
  StatusFuncionario,
  { label: string; variant: "success" | "warning" | "away" | "destructive" }
> = {
  ATIVO: { label: "Ativo", variant: "success" },
  FERIAS: { label: "Férias", variant: "warning" },
  AFASTADO: { label: "Afastado", variant: "away" },
  DESLIGADO: { label: "Desligado", variant: "destructive" },
}

export function FuncionarioStatusBadge({
  status,
}: {
  status: StatusFuncionario
}) {
  const config = FUNCIONARIO_STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
