import type { StatusFuncionario } from "@/generated/prisma/enums"

export const STATUS_FUNCIONARIO_LABEL: Record<StatusFuncionario, string> = {
  ATIVO: "Ativo",
  FERIAS: "Férias",
  AFASTADO: "Afastado",
  DESLIGADO: "Desligado",
}
