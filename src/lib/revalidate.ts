import { revalidatePath } from "next/cache"

// Toda mutação de negócio (colaboradores, cargos, benefícios, férias, folha)
// pode mudar o que aparece nos KPIs da Visão Geral, na tabela de Filtros e
// na trilha de Auditoria, além da própria tela de origem — por isso as
// Server Actions revalidam esse conjunto fixo de rotas em vez de só a sua.
export function revalidateAppPaths() {
  revalidatePath("/colaboradores")
  revalidatePath("/folha")
  revalidatePath("/filtros")
  revalidatePath("/auditoria")
  revalidatePath("/ferias")
  revalidatePath("/")
}
