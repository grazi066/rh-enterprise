import { Badge } from "@/components/ui/badge"
import type { StatusFolha, StatusItemFolha } from "@/generated/prisma/enums"

const FOLHA_STATUS_CONFIG: Record<
  StatusFolha,
  { label: string; variant: "warning" | "info" | "success" }
> = {
  PENDENTE: { label: "Pendente", variant: "warning" },
  PROCESSANDO: { label: "Processando", variant: "info" },
  PAGO: { label: "Pago", variant: "success" },
}

export function FolhaStatusBadge({ status }: { status: StatusFolha }) {
  const config = FOLHA_STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

const ITEM_FOLHA_STATUS_CONFIG: Record<
  StatusItemFolha,
  { label: string; variant: "warning" | "success" }
> = {
  PENDENTE: { label: "Pendente", variant: "warning" },
  PAGO: { label: "Pago", variant: "success" },
}

export function ItemFolhaStatusBadge({ status }: { status: StatusItemFolha }) {
  const config = ITEM_FOLHA_STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
