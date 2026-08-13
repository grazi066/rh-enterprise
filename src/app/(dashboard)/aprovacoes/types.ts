import type { ApprovalStatus } from "@/components/status-badge"
import type { TipoSolicitacao } from "@/generated/prisma/enums"

export interface FuncionarioOption {
  id: string
  nome: string
  departamento: string
}

export interface SolicitacaoDTO {
  id: string
  tipo: TipoSolicitacao
  status: ApprovalStatus
  justificativa: string | null
  createdAt: string
  funcionario: {
    id: string
    nome: string
  }
}
