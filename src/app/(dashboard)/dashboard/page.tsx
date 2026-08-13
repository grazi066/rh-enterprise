import { Briefcase, CalendarClock, ClipboardCheck, Users } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { employees } from "@/lib/mock-data"
import { prisma } from "@/lib/prisma"
import { reconcileAllFuncionarioStatusFerias } from "@/lib/sync-funcionario-ferias-status"
import { STATUS_SOLICITACAO_TO_APPROVAL_STATUS, TIPO_SOLICITACAO_LABEL } from "@/lib/status-labels"

export default async function DashboardPage() {
  // "Colaboradores ativos", "Em férias" e "Aprovações pendentes" já vêm do
  // Prisma; "Departamentos" ainda é mock-data (não há um cadastro de
  // departamentos separado do texto livre em Cargo.departamento).
  await reconcileAllFuncionarioStatusFerias()
  const [colaboradoresAtivos, colaboradoresEmFerias, aprovacoesPendentes, solicitacoesRecentes] =
    await Promise.all([
      prisma.funcionario.count({ where: { status: "ATIVO" } }),
      prisma.funcionario.count({ where: { status: "FERIAS" } }),
      prisma.solicitacao.count({ where: { status: "PENDENTE" } }),
      prisma.solicitacao.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { funcionario: { select: { nome: true } } },
      }),
    ])

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
      value: aprovacoesPendentes,
      icon: ClipboardCheck,
    },
    {
      label: "Departamentos",
      value: new Set(employees.map((e) => e.department)).size,
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
          Resumo do quadro de colaboradores e solicitações recentes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <div className="flex size-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <kpi.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitacoesRecentes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    Nenhuma solicitação registrada ainda.
                  </TableCell>
                </TableRow>
              ) : (
                solicitacoesRecentes.map((solicitacao) => (
                  <TableRow key={solicitacao.id}>
                    <TableCell className="font-medium">
                      {solicitacao.funcionario.nome}
                    </TableCell>
                    <TableCell>{TIPO_SOLICITACAO_LABEL[solicitacao.tipo]}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {solicitacao.createdAt.toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge
                        status={STATUS_SOLICITACAO_TO_APPROVAL_STATUS[solicitacao.status]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
