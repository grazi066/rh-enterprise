"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { Prisma, StatusFolha, StatusItemFolha } from "@/generated/prisma/client"
import { registrarAuditLog } from "@/lib/audit"

export interface ActionResult {
  success: boolean
  message: string
}

// Desconto ilustrativo para dar substância à métrica "Total de Descontos"
// da demo — NÃO é um cálculo real de INSS/IRRF. Se este projeto virar algo
// de verdade, substitua por uma tabela de alíquotas de verdade.
const TAXA_DESCONTO_ILUSTRATIVA = 0.11

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function periodoLabel(mes: number, ano: number) {
  return `${String(mes).padStart(2, "0")}/${ano}`
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

async function recomputeFolhaStatus(tx: Prisma.TransactionClient, folhaId: string) {
  const itens = await tx.itemFolha.findMany({
    where: { folhaId },
    select: { status: true },
  })
  const totalItens = itens.length
  const pagos = itens.filter((item) => item.status === StatusItemFolha.PAGO).length

  const status =
    totalItens > 0 && pagos === totalItens
      ? StatusFolha.PAGO
      : pagos > 0
        ? StatusFolha.PROCESSANDO
        : StatusFolha.PENDENTE

  await tx.folhaPagamento.update({
    where: { id: folhaId },
    data: {
      status,
      dataPagamento: status === StatusFolha.PAGO ? new Date() : null,
    },
  })
}

async function recomputeFolhaValorTotal(tx: Prisma.TransactionClient, folhaId: string) {
  const itens = await tx.itemFolha.findMany({
    where: { folhaId },
    select: { valorLiquido: true },
  })
  const valorTotal = round2(
    itens.reduce((total, item) => total + item.valorLiquido.toNumber(), 0)
  )
  await tx.folhaPagamento.update({ where: { id: folhaId }, data: { valorTotal } })
}

export async function gerarFolha(mes: number, ano: number): Promise<ActionResult> {
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    return { success: false, message: "Mês inválido." }
  }
  if (!Number.isInteger(ano) || ano < 2000 || ano > 2100) {
    return { success: false, message: "Ano inválido." }
  }

  const existente = await prisma.folhaPagamento.findUnique({
    where: { mes_ano: { mes, ano } },
  })
  if (existente) {
    return {
      success: false,
      message: `A folha de ${periodoLabel(mes, ano)} já foi gerada.`,
    }
  }

  const funcionarios = await prisma.funcionario.findMany({
    where: { status: { not: "DESLIGADO" } },
    select: { id: true, salarioAtual: true },
  })
  if (funcionarios.length === 0) {
    return {
      success: false,
      message: "Não há colaboradores ativos para gerar a folha.",
    }
  }

  const itens = funcionarios.map((funcionario) => {
    const salarioBruto = funcionario.salarioAtual.toNumber()
    const descontos = round2(salarioBruto * TAXA_DESCONTO_ILUSTRATIVA)
    const valorLiquido = round2(salarioBruto - descontos)
    return { funcionarioId: funcionario.id, salarioBruto, descontos, valorLiquido }
  })
  const valorTotal = round2(itens.reduce((total, item) => total + item.valorLiquido, 0))

  try {
    await prisma.$transaction(async (tx) => {
      const folha = await tx.folhaPagamento.create({
        data: { mes, ano, valorTotal, status: StatusFolha.PENDENTE },
      })
      await tx.itemFolha.createMany({
        data: itens.map((item) => ({ ...item, folhaId: folha.id })),
      })
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        success: false,
        message: `A folha de ${periodoLabel(mes, ano)} já foi gerada.`,
      }
    }
    return { success: false, message: "Erro ao gerar a folha de pagamento." }
  }

  revalidatePath("/folha")
  return {
    success: true,
    message: `Folha de ${periodoLabel(mes, ano)} gerada com ${itens.length} colaborador(es).`,
  }
}

export async function editarItemFolha(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const itemId = readText(formData, "itemId")
  const salarioBruto = readNumber(formData, "salarioBruto")
  const descontos = readNumber(formData, "descontos")
  const observacao = readText(formData, "observacao")

  if (!itemId) {
    return { success: false, message: "Item de folha inválido." }
  }
  if (salarioBruto === null || salarioBruto < 0) {
    return { success: false, message: "Informe um salário bruto válido." }
  }
  if (descontos === null || descontos < 0) {
    return { success: false, message: "Informe um valor de descontos válido." }
  }
  if (descontos > salarioBruto) {
    return {
      success: false,
      message: "Os descontos não podem ser maiores que o salário bruto.",
    }
  }

  const itemAtual = await prisma.itemFolha.findUnique({
    where: { id: itemId },
    include: { funcionario: { select: { nome: true } } },
  })
  if (!itemAtual) {
    return { success: false, message: "Item de folha não encontrado." }
  }
  if (itemAtual.status === StatusItemFolha.PAGO) {
    return {
      success: false,
      message: "Este item já foi pago e não pode mais ser editado.",
    }
  }

  const valorLiquido = round2(salarioBruto - descontos)

  try {
    await prisma.$transaction(async (tx) => {
      await tx.itemFolha.update({
        where: { id: itemId },
        data: {
          salarioBruto,
          descontos,
          valorLiquido,
          observacao: observacao || null,
        },
      })
      await recomputeFolhaValorTotal(tx, itemAtual.folhaId)
    })
  } catch {
    return { success: false, message: "Erro ao atualizar o item da folha." }
  }

  revalidatePath("/folha")
  return {
    success: true,
    message: `Item de ${itemAtual.funcionario.nome} atualizado.`,
  }
}

export async function marcarItemComoPago(itemId: string): Promise<ActionResult> {
  try {
    const item = await prisma.itemFolha.update({
      where: { id: itemId },
      data: { status: StatusItemFolha.PAGO, dataPagamento: new Date() },
      include: { funcionario: { select: { nome: true } } },
    })
    await prisma.$transaction(async (tx) => {
      await recomputeFolhaStatus(tx, item.folhaId)
      await registrarAuditLog(
        {
          acao: "PAGAMENTO_FOLHA",
          entidade: "Folha",
          entidadeId: item.folhaId,
          detalhes: JSON.stringify({
            funcionario: item.funcionario.nome,
            itemFolhaId: item.id,
            valorLiquido: item.valorLiquido.toNumber(),
            dataPagamento: item.dataPagamento?.toISOString() ?? null,
          }),
        },
        tx
      )
    })

    revalidatePath("/folha")
    return {
      success: true,
      message: `Pagamento de ${item.funcionario.nome} marcado como pago.`,
    }
  } catch {
    return { success: false, message: "Erro ao marcar o pagamento como pago." }
  }
}

export async function processarFolhaCompleta(folhaId: string): Promise<ActionResult> {
  try {
    const totalPago = await prisma.$transaction(async (tx) => {
      const { count } = await tx.itemFolha.updateMany({
        where: { folhaId, status: StatusItemFolha.PENDENTE },
        data: { status: StatusItemFolha.PAGO, dataPagamento: new Date() },
      })
      await recomputeFolhaStatus(tx, folhaId)
      return count
    })

    revalidatePath("/folha")

    if (totalPago === 0) {
      return { success: true, message: "Todos os pagamentos já estavam quitados." }
    }
    return {
      success: true,
      message: `Folha processada: ${totalPago} pagamento(s) marcado(s) como pago.`,
    }
  } catch {
    return { success: false, message: "Erro ao processar a folha completa." }
  }
}
