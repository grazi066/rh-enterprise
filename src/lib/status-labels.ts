import type { StatusFuncionario, StatusSolicitacao, TipoSolicitacao } from "@/generated/prisma/enums"
import type { ApprovalStatus } from "@/components/status-badge"

export const STATUS_FUNCIONARIO_LABEL: Record<StatusFuncionario, string> = {
  ATIVO: "Ativo",
  FERIAS: "Férias",
  AFASTADO: "Afastado",
  DESLIGADO: "Desligado",
}

export const TIPO_SOLICITACAO_LABEL: Record<TipoSolicitacao, string> = {
  FERIAS: "Férias",
  REEMBOLSO: "Reembolso",
  AJUSTE_SALARIAL: "Ajuste Salarial",
  ALTERACAO_CARGO: "Alteração de Cargo",
}

export const STATUS_SOLICITACAO_TO_APPROVAL_STATUS: Record<StatusSolicitacao, ApprovalStatus> = {
  PENDENTE: "pendente",
  APROVADO: "aprovado",
  REPROVADO: "reprovado",
}
