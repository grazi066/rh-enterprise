import { Badge } from "@/components/ui/badge"
import type { StatusFerias } from "@/generated/prisma/enums"

const FERIAS_STATUS_CONFIG: Record<
  StatusFerias,
  { label: string; variant: "success" | "info" | "warning" | "destructive" }
> = {
  CONCLUIDA: { label: "Concluída", variant: "success" },
  EM_ANDAMENTO: { label: "Em Andamento", variant: "info" },
  AGENDADA: { label: "Agendada", variant: "warning" },
  CANCELADA: { label: "Cancelada", variant: "destructive" },
}

export function FeriasStatusBadge({ status }: { status: StatusFerias }) {
  const config = FERIAS_STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
