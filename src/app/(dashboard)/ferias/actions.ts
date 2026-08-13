"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { StatusFerias } from "@/generated/prisma/client"
import { syncFuncionarioStatusFerias } from "@/lib/sync-funcionario-ferias-status"
import { registrarAuditLog } from "@/lib/audit"

export interface ActionResult {
  success: boolean
  message: string
}

function readText(formData: FormData, field: string) {
  const value = formData.get(field)
  return typeof value === "string" ? value.trim() : ""
}

function readNumber(formData: FormData, field: string) {
  const value = formData.get(field)
  if (typeof value !== "string" || value.trim() === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR")

export async function createFerias(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const funcionarioId = readText(formData, "funcionarioId")
  const dataInicioRaw = readText(formData, "dataInicio")
  const dataFimRaw = readText(formData, "dataFim")
  const dias = readNumber(formData, "dias")

  if (!funcionarioId) {
    return { success: false, message: "Selecione o colaborador." }
  }

  const dataInicio = dataInicioRaw ? new Date(dataInicioRaw) : null
  const dataFim = dataFimRaw ? new Date(dataFimRaw) : null
  if (!dataInicio || Number.isNaN(dataInicio.getTime())) {
    return { success: false, message: "Informe a data de início." }
  }
  if (!dataFim || Number.isNaN(dataFim.getTime())) {
    return { success: false, message: "Informe a data de fim." }
  }
  if (dataFim < dataInicio) {
    return {
      success: false,
      message: "A data de fim não pode ser anterior à data de início.",
    }
  }
  if (dias === null || dias < 1) {
    return { success: false, message: "Informe a quantidade de dias." }
  }

  const funcionario = await prisma.funcionario.findUnique({
    where: { id: funcionarioId },
    select: { nome: true },
  })
  if (!funcionario) {
    return { success: false, message: "Colaborador não encontrado." }
  }

  // Regra de negócio: não permitir períodos sobrepostos (ignorando os já
  // cancelados) para o mesmo colaborador.
  const sobreposta = await prisma.ferias.findFirst({
    where: {
      funcionarioId,
      status: { not: StatusFerias.CANCELADA },
      dataInicio: { lte: dataFim },
      dataFim: { gte: dataInicio },
    },
  })
  if (sobreposta) {
    return {
      success: false,
      message: `${funcionario.nome} já tem férias registradas de ${dateFormatter.format(
        sobreposta.dataInicio
      )} a ${dateFormatter.format(sobreposta.dataFim)}, que se sobrepõem a este período.`,
    }
  }

  const ferias = await prisma.ferias.create({
    data: {
      funcionarioId,
      dataInicio,
      dataFim,
      dias,
      status: StatusFerias.AGENDADA,
    },
  })

  await registrarAuditLog({
    acao: "APROVACAO_FERIAS",
    entidade: "Ferias",
    entidadeId: ferias.id,
    detalhes: JSON.stringify({
      funcionario: funcionario.nome,
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
      dias,
    }),
  })

  // Se o período já começou (cobre a data de hoje), o colaborador entra em
  // FERIAS na hora; se é uma data futura, o status não muda ainda — ver
  // reconcileAllFuncionarioStatusFerias() para quando o período chegar.
  await syncFuncionarioStatusFerias(funcionarioId)

  revalidatePath("/ferias")
  revalidatePath("/colaboradores")
  revalidatePath("/")
  return {
    success: true,
    message: `Férias de ${funcionario.nome} agendadas com sucesso.`,
  }
}

export async function cancelFerias(id: string): Promise<ActionResult> {
  try {
    const ferias = await prisma.ferias.update({
      where: { id },
      data: { status: StatusFerias.CANCELADA },
      include: { funcionario: { select: { nome: true } } },
    })

    // Se esse período era o motivo do colaborador estar em FERIAS, e não há
    // outro período em andamento, ele volta para ATIVO.
    await syncFuncionarioStatusFerias(ferias.funcionarioId)

    await registrarAuditLog({
      acao: "CANCELAMENTO_FERIAS",
      entidade: "Ferias",
      entidadeId: ferias.id,
      detalhes: JSON.stringify({
        funcionario: ferias.funcionario.nome,
        dataInicio: ferias.dataInicio.toISOString(),
        dataFim: ferias.dataFim.toISOString(),
        dias: ferias.dias,
      }),
    })

    revalidatePath("/ferias")
    revalidatePath("/colaboradores")
    revalidatePath("/")
    return {
      success: true,
      message: `Férias de ${ferias.funcionario.nome} canceladas.`,
    }
  } catch {
    return { success: false, message: "Erro ao cancelar as férias." }
  }
}
