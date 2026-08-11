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
import { approvalRequests, employees } from "@/lib/mock-data"
import { prisma } from "@/lib/prisma"
import { reconcileAllFuncionarioStatusFerias } from "@/lib/sync-funcionario-ferias-status"

export default async function DashboardPage() {
  // "Colaboradores ativos" e "Em férias" já vêm do Prisma (Funcionario.status
  // real); "Aprovações pendentes" e "Departamentos" ainda são mock-data — ver
  // CLAUDE.md sobre o estado misto desta página.
  await reconcileAllFuncionarioStatusFerias()
  const [colaboradoresAtivos, colaboradoresEmFerias] = await Promise.all([
    prisma.funcionario.count({ where: { status: "ATIVO" } }),
    prisma.funcionario.count({ where: { status: "FERIAS" } }),
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
      value: approvalRequests.filter((r) => r.status === "pendente").length,
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
              {approvalRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.employeeName}
                  </TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(request.requestedAt).toLocaleDateString(
                      "pt-BR"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusBadge status={request.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
