import type { StatusFerias } from "@/generated/prisma/enums"

export interface FuncionarioOption {
  id: string
  nome: string
  departamento: string
}

export interface FeriasDTO {
  id: string
  dataInicio: string
  dataFim: string
  dias: number
  status: StatusFerias
  funcionario: {
    id: string
    nome: string
    departamento: string
  }
}
