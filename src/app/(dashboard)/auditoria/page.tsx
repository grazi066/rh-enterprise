import { CalendarClock, ShieldCheck, UserRound } from "lucide-react"

import { prisma } from "@/lib/prisma"
import { inicioDoDiaEmBrasilia } from "@/lib/timezone"
import { MetricCard } from "@/components/metric-card"
import { AuditoriaClient } from "./auditoria-client"
import type { AuditLogDTO } from "./types"

export default async function AuditoriaPage() {
  const [logsRaw, registrosHoje] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count({
      where: { createdAt: { gte: inicioDoDiaEmBrasilia() } },
    }),
  ])

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
          highlight
        />
        <MetricCard
          label="Registros Hoje"
          value={registrosHoje.toString()}
          icon={CalendarClock}
          highlight
        />
        <MetricCard
          label="Usuários Envolvidos"
          value={usuariosUnicos.toString()}
          icon={UserRound}
          highlight
        />
      </div>

      <AuditoriaClient logs={logs} />
    </div>
  )
}
