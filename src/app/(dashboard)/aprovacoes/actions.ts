"use server"

import { prisma } from "@/lib/prisma"
import { StatusSolicitacao } from "@/generated/prisma/client"
import { registrarAuditLog } from "@/lib/audit"
import { revalidateAppPaths } from "@/lib/revalidate"

export interface ActionResult {
  success: boolean
  message: string
}

async function revisarSolicitacao(
  id: string,
  novoStatus: typeof StatusSolicitacao.APROVADO | typeof StatusSolicitacao.REPROVADO,
  acao: string,
  mensagem: (nome: string) => string
): Promise<ActionResult> {
  try {
    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id },
      include: { funcionario: { select: { nome: true } } },
    })
    if (!solicitacao) {
      return { success: false, message: "Solicitação não encontrada." }
    }
    if (solicitacao.status !== StatusSolicitacao.PENDENTE) {
      return { success: false, message: "Esta solicitação já foi revisada." }
    }

    await prisma.solicitacao.update({
      where: { id },
      data: { status: novoStatus },
    })

    await registrarAuditLog({
      acao,
      entidade: "Solicitacao",
      entidadeId: id,
      detalhes: JSON.stringify({
        funcionario: solicitacao.funcionario.nome,
        tipo: solicitacao.tipo,
      }),
    })

    revalidateAppPaths()
    return { success: true, message: mensagem(solicitacao.funcionario.nome) }
  } catch {
    return { success: false, message: "Erro ao revisar a solicitação." }
  }
}

export async function aprovarSolicitacao(id: string): Promise<ActionResult> {
  return revisarSolicitacao(
    id,
    StatusSolicitacao.APROVADO,
    "APROVACAO_SOLICITACAO",
    (nome) => `Solicitação de ${nome} aprovada.`
  )
}

export async function rejeitarSolicitacao(id: string): Promise<ActionResult> {
  return revisarSolicitacao(
    id,
    StatusSolicitacao.REPROVADO,
    "REJEICAO_SOLICITACAO",
    (nome) => `Solicitação de ${nome} rejeitada.`
  )
}
