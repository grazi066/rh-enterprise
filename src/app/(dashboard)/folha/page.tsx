import { CircleDollarSign, MinusCircle, PiggyBank, Wallet } from "lucide-react"

import { prisma } from "@/lib/prisma"
import { currencyFormatter } from "@/lib/format"
import { Card, CardContent } from "@/components/ui/card"
import { MetricCard } from "@/components/metric-card"
import { FolhaStatusBadge } from "@/components/folha-status-badge"
import { FolhaPeriodoPicker } from "./folha-periodo-picker"
import { GerarFolhaButton } from "./gerar-folha-button"
import { FolhaTable } from "./folha-table"
import { StatusItemFolha } from "@/generated/prisma/enums"
import type { FolhaDTO } from "./types"

function periodoAtual() {
  const hoje = new Date()
  return { mes: hoje.getMonth() + 1, ano: hoje.getFullYear() }
}

function periodoLabel(mes: number, ano: number) {
  return `${String(mes).padStart(2, "0")}/${ano}`
}

export default async function FolhaPage(props: PageProps<"/folha">) {
  const searchParamsResolved = await props.searchParams
  const padrao = periodoAtual()
  const mes = Number(searchParamsResolved.mes) || padrao.mes
  const ano = Number(searchParamsResolved.ano) || padrao.ano

  const folhaRaw = await prisma.folhaPagamento.findUnique({
    where: { mes_ano: { mes, ano } },
    include: {
      itens: {
        include: { funcionario: { include: { cargo: true } } },
        orderBy: { funcionario: { nome: "asc" } },
      },
    },
  })

  let folhaDTO: FolhaDTO | null = null

  if (folhaRaw) {
    const funcionarioIds = folhaRaw.itens.map((item) => item.funcionarioId)
    const associacoes = await prisma.funcionarioBeneficio.findMany({
      where: { funcionarioId: { in: funcionarioIds } },
      select: {
        funcionarioId: true,
        valorCustomizado: true,
        beneficio: { select: { valorPadrao: true } },
      },
    })
    const beneficiosTotalPorFuncionario = new Map<string, number>()
    for (const associacao of associacoes) {
      const valor =
        associacao.valorCustomizado?.toNumber() ?? associacao.beneficio.valorPadrao.toNumber()
      beneficiosTotalPorFuncionario.set(
        associacao.funcionarioId,
        (beneficiosTotalPorFuncionario.get(associacao.funcionarioId) ?? 0) + valor
      )
    }

    folhaDTO = {
      id: folhaRaw.id,
      mes: folhaRaw.mes,
      ano: folhaRaw.ano,
      status: folhaRaw.status,
      valorTotal: folhaRaw.valorTotal.toNumber(),
      dataPagamento: folhaRaw.dataPagamento?.toISOString() ?? null,
      itens: folhaRaw.itens.map((item) => ({
        id: item.id,
        salarioBruto: item.salarioBruto.toNumber(),
        descontos: item.descontos.toNumber(),
        valorLiquido: item.valorLiquido.toNumber(),
        status: item.status,
        dataPagamento: item.dataPagamento?.toISOString() ?? null,
        observacao: item.observacao,
        funcionario: {
          id: item.funcionario.id,
          nome: item.funcionario.nome,
          cargo: {
            nome: item.funcionario.cargo.nome,
            departamento: item.funcionario.cargo.departamento,
          },
          beneficiosTotal: beneficiosTotalPorFuncionario.get(item.funcionarioId) ?? 0,
        },
      })),
    }
  }

  const totalBruto = folhaDTO?.itens.reduce((total, item) => total + item.salarioBruto, 0) ?? 0
  const totalDescontos = folhaDTO?.itens.reduce((total, item) => total + item.descontos, 0) ?? 0
  const totalLiquido = folhaDTO?.itens.reduce((total, item) => total + item.valorLiquido, 0) ?? 0
  const totalLiquidoPago =
    folhaDTO?.itens
      .filter((item) => item.status === StatusItemFolha.PAGO)
      .reduce((total, item) => total + item.valorLiquido, 0) ?? 0
  const percentualPago = totalLiquido > 0 ? Math.round((totalLiquidoPago / totalLiquido) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Folha de Pagamento
            </h1>
            {folhaDTO && <FolhaStatusBadge status={folhaDTO.status} />}
          </div>
          <p className="text-sm text-muted-foreground">
            Gere e acompanhe o pagamento mensal dos colaboradores.
          </p>
        </div>
        <FolhaPeriodoPicker mes={mes} ano={ano} />
      </div>

      {!folhaDTO ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma folha gerada para {periodoLabel(mes, ano)} ainda.
            </p>
            <GerarFolhaButton mes={mes} ano={ano} />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Bruto"
              value={currencyFormatter.format(totalBruto)}
              icon={Wallet}
              colorClassName="bg-primary/10 text-primary"
            />
            <MetricCard
              label="Total de Descontos"
              value={currencyFormatter.format(totalDescontos)}
              icon={MinusCircle}
              colorClassName="bg-destructive/10 text-destructive"
              hint="Estimativa ilustrativa (11%)"
            />
            <MetricCard
              label="Total Líquido"
              value={currencyFormatter.format(totalLiquido)}
              icon={CircleDollarSign}
              colorClassName="bg-success/10 text-success"
            />
            <MetricCard
              label="% Paga no Mês"
              value={`${percentualPago}%`}
              icon={PiggyBank}
              colorClassName="bg-info/10 text-info"
              hint={`${currencyFormatter.format(totalLiquidoPago)} já pagos`}
            />
          </div>

          <FolhaTable folha={folhaDTO} />
        </>
      )}
    </div>
  )
}
