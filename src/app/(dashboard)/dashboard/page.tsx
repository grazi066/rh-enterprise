import { Briefcase, CalendarClock, ClipboardCheck, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "@/components/metric-card"
import { prisma } from "@/lib/prisma"
import { reconcileAllFuncionarioStatusFerias } from "@/lib/sync-funcionario-ferias-status"
import { STATUS_SOLICITACAO_TO_APPROVAL_STATUS } from "@/lib/status-labels"
import { SolicitacoesPendentesTable } from "./solicitacoes-pendentes-table"
import type { SolicitacaoDTO } from "@/app/(dashboard)/aprovacoes/types"

export default async function DashboardPage() {
  await reconcileAllFuncionarioStatusFerias()
  const [
    colaboradoresAtivos,
    colaboradoresEmFerias,
    departamentosDistintos,
    solicitacoesPendentes,
  ] = await Promise.all([
    prisma.funcionario.count({ where: { status: "ATIVO" } }),
    prisma.funcionario.count({ where: { status: "FERIAS" } }),
    prisma.cargo.findMany({
      distinct: ["departamento"],
      select: { departamento: true },
    }),
    prisma.solicitacao.findMany({
      where: { status: "PENDENTE" },
      orderBy: { createdAt: "asc" },
      include: { funcionario: { select: { id: true, nome: true } } },
    }),
  ])

  const solicitacoesPendentesDTO: SolicitacaoDTO[] = solicitacoesPendentes.map(
    (solicitacao) => ({
      id: solicitacao.id,
      tipo: solicitacao.tipo,
      status: STATUS_SOLICITACAO_TO_APPROVAL_STATUS[solicitacao.status],
      justificativa: solicitacao.justificativa,
      createdAt: solicitacao.createdAt.toISOString(),
      funcionario: {
        id: solicitacao.funcionario.id,
        nome: solicitacao.funcionario.nome,
      },
    })
  )

  const kpis = [
    {
      label: "Colaboradores ativos",
      value: colaboradoresAtivos,
      icon: Users,
    },
    {
      label: "Em férias",
      value: colaboradoresEmFerias,
      icon: CalendarClock,
    },
    {
      label: "Aprovações pendentes",
      value: solicitacoesPendentesDTO.length,
      icon: ClipboardCheck,
      highlight: true,
    },
    {
      label: "Departamentos",
      value: departamentosDistintos.length,
      icon: Briefcase,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Visão Geral
        </h1>
        <p className="text-sm text-muted-foreground">
          Resumo do quadro de colaboradores e solicitações pendentes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <MetricCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value.toString()}
            icon={kpi.icon}
            highlight={kpi.highlight}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <SolicitacoesPendentesTable solicitacoes={solicitacoesPendentesDTO} />
        </CardContent>
      </Card>
    </div>
  )
}
