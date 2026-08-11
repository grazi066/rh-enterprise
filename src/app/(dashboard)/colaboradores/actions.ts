"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { Prisma, StatusFerias, StatusFuncionario } from "@/generated/prisma/client"

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

function isStatusFuncionario(value: string): value is StatusFuncionario {
  return Object.values(StatusFuncionario).includes(value as StatusFuncionario)
}

interface BeneficioSelecionado {
  beneficioId: string
  valorCustomizado: number | null
}

function readBeneficiosSelecionados(formData: FormData): BeneficioSelecionado[] {
  return formData.getAll("beneficio").map((raw) => {
    const beneficioId = String(raw)
    const valorCustomizado = readNumber(formData, `valorCustomizado_${beneficioId}`)
    return { beneficioId, valorCustomizado }
  })
}

interface FuncionarioInput {
  nome: string
  email: string
  cpf: string
  dataAdmissao: Date
  status: StatusFuncionario
  cargoId: string
  salarioAtual: number
}

function validateFuncionarioInput(
  formData: FormData
): { valid: true; data: FuncionarioInput } | { valid: false; error: string } {
  const nome = readText(formData, "nome")
  const email = readText(formData, "email")
  const cpf = readText(formData, "cpf")
  const dataAdmissaoRaw = readText(formData, "dataAdmissao")
  const status = readText(formData, "status")
  const cargoId = readText(formData, "cargoId")
  const salarioAtual = readNumber(formData, "salarioAtual")

  if (nome.length < 2) {
    return { valid: false, error: "Informe o nome completo do colaborador." }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: "Informe um e-mail válido." }
  }
  const cpfDigits = cpf.replace(/\D/g, "")
  if (cpfDigits.length !== 11) {
    return { valid: false, error: "Informe um CPF válido (11 dígitos)." }
  }
  const dataAdmissao = dataAdmissaoRaw ? new Date(dataAdmissaoRaw) : null
  if (!dataAdmissao || Number.isNaN(dataAdmissao.getTime())) {
    return { valid: false, error: "Informe a data de admissão." }
  }
  if (!isStatusFuncionario(status)) {
    return { valid: false, error: "Selecione um status válido." }
  }
  if (!cargoId) {
    return { valid: false, error: "Selecione o cargo do colaborador." }
  }
  if (salarioAtual === null || salarioAtual < 0) {
    return { valid: false, error: "Informe um salário válido." }
  }

  return {
    valid: true,
    data: { nome, email, cpf: cpfDigits, dataAdmissao, status, cargoId, salarioAtual },
  }
}

function friendlyPrismaError(error: unknown, fallback: string): ActionResult {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : ""
      if (target.includes("email")) {
        return { success: false, message: "Já existe um colaborador com esse e-mail." }
      }
      if (target.includes("cpf")) {
        return { success: false, message: "Já existe um colaborador com esse CPF." }
      }
      return { success: false, message: "Já existe um registro com esses dados." }
    }
  }
  return { success: false, message: fallback }
}

async function syncBeneficios(
  tx: Prisma.TransactionClient,
  funcionarioId: string,
  selecionados: BeneficioSelecionado[]
) {
  const idsSelecionados = selecionados.map((item) => item.beneficioId)

  await tx.funcionarioBeneficio.deleteMany({
    where: {
      funcionarioId,
      ...(idsSelecionados.length > 0 && { beneficioId: { notIn: idsSelecionados } }),
    },
  })

  for (const item of selecionados) {
    await tx.funcionarioBeneficio.upsert({
      where: {
        funcionarioId_beneficioId: {
          funcionarioId,
          beneficioId: item.beneficioId,
        },
      },
      update: { valorCustomizado: item.valorCustomizado },
      create: {
        funcionarioId,
        beneficioId: item.beneficioId,
        valorCustomizado: item.valorCustomizado,
      },
    })
  }
}

export async function createFuncionario(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const result = validateFuncionarioInput(formData)
  if (!result.valid) {
    return { success: false, message: result.error }
  }
  const beneficiosSelecionados = readBeneficiosSelecionados(formData)

  try {
    await prisma.$transaction(async (tx) => {
      const funcionario = await tx.funcionario.create({ data: result.data })

      await tx.historicoSalario.create({
        data: {
          funcionarioId: funcionario.id,
          valor: result.data.salarioAtual,
          motivo: "Contratação",
          dataAlteracao: result.data.dataAdmissao,
        },
      })

      await syncBeneficios(tx, funcionario.id, beneficiosSelecionados)
    })
  } catch (error) {
    return friendlyPrismaError(error, "Erro ao cadastrar o colaborador.")
  }

  revalidatePath("/colaboradores")
  return { success: true, message: `Colaborador "${result.data.nome}" cadastrado com sucesso.` }
}

export async function updateFuncionario(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const id = readText(formData, "id")
  if (!id) {
    return { success: false, message: "Colaborador inválido." }
  }

  const result = validateFuncionarioInput(formData)
  if (!result.valid) {
    return { success: false, message: result.error }
  }

  const motivoAlteracaoSalarial = readText(formData, "motivoAlteracaoSalarial")
  const beneficiosSelecionados = readBeneficiosSelecionados(formData)

  try {
    const atual = await prisma.funcionario.findUniqueOrThrow({
      where: { id },
      select: { salarioAtual: true, status: true },
    })
    const salarioMudou = atual.salarioAtual.toNumber() !== result.data.salarioAtual
    const saiuDeFerias =
      atual.status === StatusFuncionario.FERIAS &&
      result.data.status !== StatusFuncionario.FERIAS

    if (salarioMudou && motivoAlteracaoSalarial.length < 3) {
      return {
        success: false,
        message: "Informe o motivo da alteração salarial.",
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.funcionario.update({ where: { id }, data: result.data })

      if (salarioMudou) {
        await tx.historicoSalario.create({
          data: {
            funcionarioId: id,
            valor: result.data.salarioAtual,
            motivo: motivoAlteracaoSalarial,
          },
        })
      }

      // O RH tirou manualmente o colaborador de FERIAS (ex.: voltou mais
      // cedo do previsto). Sem isso, o próximo
      // reconcileAllFuncionarioStatusFerias() encontraria o período de
      // férias ainda em aberto cobrindo hoje e desfaria a troca manual,
      // jogando o status de volta para FERIAS.
      if (saiuDeFerias) {
        const hoje = new Date()
        await tx.ferias.updateMany({
          where: {
            funcionarioId: id,
            status: { not: StatusFerias.CANCELADA },
            dataInicio: { lte: hoje },
            dataFim: { gte: hoje },
          },
          data: { status: StatusFerias.CANCELADA },
        })
      }

      await syncBeneficios(tx, id, beneficiosSelecionados)
    })
  } catch (error) {
    return friendlyPrismaError(error, "Erro ao atualizar o colaborador.")
  }

  revalidatePath("/colaboradores")
  revalidatePath("/ferias")
  revalidatePath("/")
  return { success: true, message: `Colaborador "${result.data.nome}" atualizado com sucesso.` }
}

export async function deleteFuncionario(id: string): Promise<ActionResult> {
  try {
    const funcionario = await prisma.funcionario.delete({ where: { id } })
    revalidatePath("/colaboradores")
    return { success: true, message: `Colaborador "${funcionario.nome}" excluído.` }
  } catch {
    return { success: false, message: "Erro ao excluir o colaborador." }
  }
}
