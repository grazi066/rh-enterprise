import { StatusFerias } from "@/generated/prisma/enums"

interface FeriasLike {
  status: StatusFerias
  dataInicio: string | Date
  dataFim: string | Date
}

/**
 * Status "ao vivo" de um período de férias. CANCELADA é sempre respeitado
 * (ação explícita do usuário); os demais são derivados da data atual em vez
 * de depender de um job de transição de status.
 */
export function computeFeriasStatus(ferias: FeriasLike): StatusFerias {
  if (ferias.status === StatusFerias.CANCELADA) return StatusFerias.CANCELADA

  const hoje = new Date()
  const inicio = new Date(ferias.dataInicio)
  const fim = new Date(ferias.dataFim)

  if (hoje < inicio) return StatusFerias.AGENDADA
  if (hoje > fim) return StatusFerias.CONCLUIDA
  return StatusFerias.EM_ANDAMENTO
}
