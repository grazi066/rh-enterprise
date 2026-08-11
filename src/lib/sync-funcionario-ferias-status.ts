import { prisma } from "@/lib/prisma"
import { StatusFerias, StatusFuncionario } from "@/generated/prisma/client"

/**
 * Sincroniza o `Funcionario.status` de UM colaborador com a existência (ou
 * não) de um período de férias em andamento neste momento. Chamada
 * diretamente pelas Server Actions de férias (`createFerias`/`cancelFerias`)
 * logo após criar/cancelar um período, para refletir a mudança na hora.
 *
 * - Se o colaborador tem uma `Ferias` não cancelada cobrindo hoje → `FERIAS`.
 * - Senão, se o status atual é `FERIAS` → volta para `ATIVO` (nunca mexe em
 *   `AFASTADO`/`DESLIGADO` nesse sentido — só quem já estava `FERIAS` volta).
 */
export async function syncFuncionarioStatusFerias(funcionarioId: string) {
  const hoje = new Date()

  const feriasEmAndamento = await prisma.ferias.findFirst({
    where: {
      funcionarioId,
      status: { not: StatusFerias.CANCELADA },
      dataInicio: { lte: hoje },
      dataFim: { gte: hoje },
    },
    select: { id: true },
  })

  const funcionario = await prisma.funcionario.findUnique({
    where: { id: funcionarioId },
    select: { status: true },
  })
  if (!funcionario) return

  if (feriasEmAndamento) {
    if (funcionario.status !== StatusFuncionario.FERIAS) {
      await prisma.funcionario.update({
        where: { id: funcionarioId },
        data: { status: StatusFuncionario.FERIAS },
      })
    }
  } else if (funcionario.status === StatusFuncionario.FERIAS) {
    await prisma.funcionario.update({
      where: { id: funcionarioId },
      data: { status: StatusFuncionario.ATIVO },
    })
  }
}

/**
 * Rede de segurança: não existe job/cron neste projeto para virar o status
 * de volta pra `ATIVO` no exato instante em que um período de férias termina
 * sozinho (sem ninguém cancelar nada). Em vez disso, reconciliamos em massa
 * toda vez que `/ferias` ou `/colaboradores` são carregadas — então o pior
 * caso é o status ficar "atrasado" até a próxima visita a uma dessas
 * páginas, nunca incorreto para sempre.
 */
export async function reconcileAllFuncionarioStatusFerias() {
  const hoje = new Date()

  const marcadosFeriasSemPeriodoAtivo = await prisma.funcionario.findMany({
    where: {
      status: StatusFuncionario.FERIAS,
      ferias: {
        none: {
          status: { not: StatusFerias.CANCELADA },
          dataInicio: { lte: hoje },
          dataFim: { gte: hoje },
        },
      },
    },
    select: { id: true },
  })
  if (marcadosFeriasSemPeriodoAtivo.length > 0) {
    await prisma.funcionario.updateMany({
      where: { id: { in: marcadosFeriasSemPeriodoAtivo.map((f) => f.id) } },
      data: { status: StatusFuncionario.ATIVO },
    })
  }

  const ativosComPeriodoAtivo = await prisma.funcionario.findMany({
    where: {
      status: StatusFuncionario.ATIVO,
      ferias: {
        some: {
          status: { not: StatusFerias.CANCELADA },
          dataInicio: { lte: hoje },
          dataFim: { gte: hoje },
        },
      },
    },
    select: { id: true },
  })
  if (ativosComPeriodoAtivo.length > 0) {
    await prisma.funcionario.updateMany({
      where: { id: { in: ativosComPeriodoAtivo.map((f) => f.id) } },
      data: { status: StatusFuncionario.FERIAS },
    })
  }
}
