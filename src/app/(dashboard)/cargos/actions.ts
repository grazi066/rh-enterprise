"use server"

import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
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

function validateCargoInput(
  formData: FormData
):
  | { valid: true; data: { nome: string; departamento: string; salarioBase: number } }
  | { valid: false; error: string } {
  const nome = readText(formData, "nome")
  const departamento = readText(formData, "departamento")
  const salarioBase = readNumber(formData, "salarioBase")

  if (nome.length < 2) {
    return { valid: false, error: "Informe um nome de cargo com pelo menos 2 caracteres." }
  }
  if (departamento.length < 2) {
    return { valid: false, error: "Informe o departamento do cargo." }
  }
  if (salarioBase === null || salarioBase < 0) {
    return { valid: false, error: "Informe um salário-base válido." }
  }

  return { valid: true, data: { nome, departamento, salarioBase } }
}

export async function createCargo(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const result = validateCargoInput(formData)
  if (!result.valid) {
    return { success: false, message: result.error }
  }

  await prisma.cargo.create({ data: result.data })

  revalidateAppPaths()
  return {
    success: true,
    message: `Cargo "${result.data.nome}" criado com sucesso.`,
  }
}

export async function updateCargo(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const id = readText(formData, "id")
  if (!id) {
    return { success: false, message: "Cargo inválido." }
  }

  const result = validateCargoInput(formData)
  if (!result.valid) {
    return { success: false, message: result.error }
  }

  await prisma.cargo.update({ where: { id }, data: result.data })

  revalidateAppPaths()
  return {
    success: true,
    message: `Cargo "${result.data.nome}" atualizado com sucesso.`,
  }
}

export async function deleteCargo(id: string): Promise<ActionResult> {
  try {
    const cargo = await prisma.cargo.delete({ where: { id } })
    revalidateAppPaths()
    return { success: true, message: `Cargo "${cargo.nome}" excluído.` }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        success: false,
        message:
          "Não é possível excluir: há colaboradores vinculados a este cargo.",
      }
    }
    return { success: false, message: "Erro ao excluir o cargo." }
  }
}
