import { CalendarClock, ShieldCheck, UserRound } from "lucide-react"

import { prisma } from "@/lib/prisma"
import { MetricCard } from "@/components/metric-card"
import { AuditoriaClient } from "./auditoria-client"
import type { AuditLogDTO } from "./types"

export default async function AuditoriaPage() {
  const logsRaw = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
  })

  const logs: AuditLogDTO[] = logsRaw.map((log) => ({
    id: log.id,
    usuarioId: log.usuarioId,
    usuarioNome: log.usuarioNome,
    acao: log.acao,
    entidade: log.entidade,
    entidadeId: log.entidadeId,
    detalhes: log.detalhes,
    createdAt: log.createdAt.toISOString(),
  }))

  const hoje = new Date()
  const registrosHoje = logs.filter((log) => {
    const data = new Date(log.createdAt)
    return (
      data.getFullYear() === hoje.getFullYear() &&
      data.getMonth() === hoje.getMonth() &&
      data.getDate() === hoje.getDate()
    )
  }).length

  const usuariosUnicos = new Set(
    logs.map((log) => log.usuarioNome).filter((nome): nome is string => !!nome)
  ).size

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Auditoria &amp; Segurança
        </h1>
        <p className="text-sm text-muted-foreground">
          Trilha de auditoria das ações sensíveis realizadas na plataforma
          (alterações salariais, de cargo e status, férias e pagamentos de
          folha).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total de Registros"
          value={logs.length.toString()}
          icon={ShieldCheck}
          colorClassName="bg-primary/10 text-primary"
        />
        <MetricCard
          label="Registros Hoje"
          value={registrosHoje.toString()}
          icon={CalendarClock}
          colorClassName="bg-info/10 text-info"
        />
        <MetricCard
          label="Usuários Envolvidos"
          value={usuariosUnicos.toString()}
          icon={UserRound}
          colorClassName="bg-accent/10 text-accent-foreground"
        />
      </div>

      <AuditoriaClient logs={logs} />
    </div>
  )
}
