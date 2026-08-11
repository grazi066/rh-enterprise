import type { StatusFuncionario, TipoBeneficio } from "@/generated/prisma/enums"

export interface CargoOption {
  id: string
  nome: string
  departamento: string
  salarioBase: number
}

export interface BeneficioOption {
  id: string
  nome: string
  tipo: TipoBeneficio
  valorPadrao: number
}

export interface FuncionarioBeneficioItem {
  beneficioId: string
  valorCustomizado: number | null
  beneficio: BeneficioOption
}

export interface HistoricoSalarioItem {
  id: string
  valor: number
  motivo: string
  dataAlteracao: string
}

export interface FuncionarioDTO {
  id: string
  nome: string
  email: string
  cpf: string
  dataAdmissao: string
  status: StatusFuncionario
  salarioAtual: number
  cargo: CargoOption
  beneficios: FuncionarioBeneficioItem[]
  historicoSalarios: HistoricoSalarioItem[]
}
