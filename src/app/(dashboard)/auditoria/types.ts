export interface AuditLogDTO {
  id: string
  usuarioId: string | null
  usuarioNome: string | null
  acao: string
  entidade: string
  entidadeId: string | null
  detalhes: string | null
  createdAt: string
}
