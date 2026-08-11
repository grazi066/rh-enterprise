import type { StatusFolha, StatusItemFolha } from "@/generated/prisma/enums"

export interface ItemFolhaDTO {
  id: string
  salarioBruto: number
  descontos: number
  valorLiquido: number
  status: StatusItemFolha
  dataPagamento: string | null
  observacao: string | null
  funcionario: {
    id: string
    nome: string
    cargo: { nome: string; departamento: string }
    beneficiosTotal: number
  }
}

export interface FolhaDTO {
  id: string
  mes: number
  ano: number
  status: StatusFolha
  valorTotal: number
  dataPagamento: string | null
  itens: ItemFolhaDTO[]
}
