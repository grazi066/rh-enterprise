import type { ApprovalStatus } from "@/components/status-badge"
import type { TipoSolicitacao } from "@/generated/prisma/enums"

export interface SolicitacaoDTO {
  id: string
  tipo: TipoSolicitacao
  status: ApprovalStatus
  createdAt: string
  funcionario: {
    id: string
    nome: string
  }
}
