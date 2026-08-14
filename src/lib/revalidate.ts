import { revalidatePath } from "next/cache"

// Toda mutação de negócio (colaboradores, cargos, benefícios, férias, folha)
// pode mudar o que aparece nos KPIs da Visão Geral, na tabela de Filtros e
// na trilha de Auditoria, além da própria tela de origem — por isso as
// Server Actions revalidam esse conjunto fixo de rotas em vez de só a sua.
export function revalidateAppPaths() {
  revalidatePath("/colaboradores")
  revalidatePath("/cargos")
  revalidatePath("/folha")
  revalidatePath("/filtros")
  revalidatePath("/auditoria")
  revalidatePath("/ferias")
  revalidatePath("/aprovacoes")
  revalidatePath("/")
  // "/" só faz redirect() para "/dashboard" — são entradas de cache
  // separadas no Full Route Cache, então revalidar "/" não invalida o
  // conteúdo (KPIs e Solicitações Pendentes) que de fato mora em "/dashboard".
  revalidatePath("/dashboard")
}
