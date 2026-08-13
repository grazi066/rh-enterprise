import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"
import { currentUser } from "@/lib/mock-data"

interface RegistrarAuditLogInput {
  acao: string
  entidade: string
  entidadeId?: string | null
  detalhes?: string | null
  usuarioId?: string | null
  usuarioNome?: string | null
}

// O projeto ainda não tem autenticação real (currentUser em mock-data.ts é o
// mesmo placeholder usado no topbar/user-menu) — até existir uma sessão de
// verdade, usuarioId fica null e usuarioNome cai para currentUser.name
// quando o chamador não informa quem realizou a ação.
export async function registrarAuditLog(
  input: RegistrarAuditLogInput,
  client: Prisma.TransactionClient | typeof prisma = prisma
) {
  await client.auditLog.create({
    data: {
      acao: input.acao,
      entidade: input.entidade,
      entidadeId: input.entidadeId ?? null,
      detalhes: input.detalhes ?? null,
      usuarioId: input.usuarioId ?? null,
      usuarioNome: input.usuarioNome ?? currentUser.name,
    },
  })
}
