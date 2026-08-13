"use server"

import { prisma } from "@/lib/prisma"
import { Prisma, TipoBeneficio } from "@/generated/prisma/client"
import { revalidateAppPaths } from "@/lib/revalidate"

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

function isTipoBeneficio(value: string): value is TipoBeneficio {
  return Object.values(TipoBeneficio).includes(value as TipoBeneficio)
}

function validateBeneficioInput(
  formData: FormData
):
  | { valid: true; data: { nome: string; tipo: TipoBeneficio; valorPadrao: number } }
  | { valid: false; error: string } {
  const nome = readText(formData, "nome")
  const tipo = readText(formData, "tipo")
  const valorPadrao = readNumber(formData, "valorPadrao")

  if (nome.length < 2) {
    return { valid: false, error: "Informe um nome de benefício com pelo menos 2 caracteres." }
  }
  if (!isTipoBeneficio(tipo)) {
    return { valid: false, error: "Selecione um tipo de benefício válido." }
  }
  if (valorPadrao === null || valorPadrao < 0) {
    return { valid: false, error: "Informe um valor padrão válido." }
  }

  return { valid: true, data: { nome, tipo, valorPadrao } }
}

export async function createBeneficio(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const result = validateBeneficioInput(formData)
  if (!result.valid) {
    return { success: false, message: result.error }
  }

  await prisma.beneficio.create({ data: result.data })

  revalidateAppPaths()
  return {
    success: true,
    message: `Benefício "${result.data.nome}" criado com sucesso.`,
  }
}

export async function updateBeneficio(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const id = readText(formData, "id")
  if (!id) {
    return { success: false, message: "Benefício inválido." }
  }

  const result = validateBeneficioInput(formData)
  if (!result.valid) {
    return { success: false, message: result.error }
  }

  await prisma.beneficio.update({ where: { id }, data: result.data })

  revalidateAppPaths()
  return {
    success: true,
    message: `Benefício "${result.data.nome}" atualizado com sucesso.`,
  }
}

export async function deleteBeneficio(id: string): Promise<ActionResult> {
  try {
    const beneficio = await prisma.beneficio.delete({ where: { id } })
    revalidateAppPaths()
    return { success: true, message: `Benefício "${beneficio.nome}" excluído.` }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        message: "Erro ao excluir o benefício. Tente novamente.",
      }
    }
    throw error
  }
}
