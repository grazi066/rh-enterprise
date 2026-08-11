import type { StatusFuncionario } from "@/generated/prisma/enums"

export interface FuncionarioFiltroDTO {
  id: string
  nome: string
  cpf: string
  email: string
  status: StatusFuncionario
  salarioAtual: number
  dataAdmissao: string
  cargo: {
    id: string
    nome: string
    departamento: string
  }
}

export interface FiltroOptions {
  departamentos: string[]
  cargos: { id: string; label: string }[]
}
