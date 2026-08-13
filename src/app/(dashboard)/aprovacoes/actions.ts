"use server"

import { prisma } from "@/lib/prisma"
import { StatusSolicitacao, TipoSolicitacao } from "@/generated/prisma/client"
import { registrarAuditLog } from "@/lib/audit"
import { revalidateAppPaths } from "@/lib/revalidate"

export interface ActionResult {
  success: boolean
  message: string
}

function readText(formData: FormData, field: string) {
  const value = formData.get(field)
  return typeof value === "string" ? value.trim() : ""
}

function isTipoSolicitacao(value: string): value is TipoSolicitacao {
  return Object.values(TipoSolicitacao).includes(value as TipoSolicitacao)
}

export async function criarSolicitacao(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const funcionarioId = readText(formData, "funcionarioId")
  const tipo = readText(formData, "tipo")
  const justificativa = readText(formData, "justificativa")

  if (!funcionarioId) {
    return { success: false, message: "Selecione o colaborador." }
  }
  if (!isTipoSolicitacao(tipo)) {
    return { success: false, message: "Selecione o tipo de solicitação." }
  }
  if (justificativa.length < 5) {
    return {
      success: false,
      message: "Informe uma justificativa com pelo menos 5 caracteres.",
    }
  }

  try {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: funcionarioId },
      select: { nome: true },
    })
    if (!funcionario) {
      return { success: false, message: "Colaborador não encontrado." }
    }

    const solicitacao = await prisma.solicitacao.create({
      data: {
        funcionarioId,
        tipo,
        justificativa,
        status: StatusSolicitacao.PENDENTE,
      },
    })

    await registrarAuditLog({
      acao: "CRIACAO_SOLICITACAO",
      entidade: "Solicitacao",
      entidadeId: solicitacao.id,
      detalhes: JSON.stringify({
        funcionario: funcionario.nome,
        tipo,
        justificativa,
      }),
    })

    revalidateAppPaths()
    return { success: true, message: `Solicitação de ${funcionario.nome} registrada.` }
  } catch {
    return { success: false, message: "Erro ao registrar a solicitação." }
  }
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
