import { CalendarRange } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { computeFeriasStatus } from "@/lib/ferias-status"
import { StatusFerias } from "@/generated/prisma/enums"
import type { FeriasDTO } from "./types"

const JANELA_EM_MESES = 3

const STATUS_BAR_CLASS: Record<StatusFerias, string> = {
  AGENDADA: "bg-warning",
  EM_ANDAMENTO: "bg-info",
  CONCLUIDA: "bg-success",
  CANCELADA: "bg-destructive",
}

const STATUS_LEGEND: { status: StatusFerias; label: string }[] = [
  { status: StatusFerias.AGENDADA, label: "Agendada" },
  { status: StatusFerias.EM_ANDAMENTO, label: "Em andamento" },
  { status: StatusFerias.CONCLUIDA, label: "Concluída" },
]

const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" })
const dateFormatter = new Intl.DateTimeFormat("pt-BR")

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

export function FeriasTimeline({ ferias }: { ferias: FeriasDTO[] }) {
  const hoje = new Date()
  const windowStart = startOfMonth(hoje)
  const windowEnd = endOfMonth(
    new Date(hoje.getFullYear(), hoje.getMonth() + JANELA_EM_MESES - 1, 1)
  )
  const totalDias = daysBetween(windowStart, windowEnd) + 1

  const meses = Array.from({ length: JANELA_EM_MESES }, (_, i) => {
    const mes = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1)
    return {
      label: monthFormatter.format(mes),
      leftPercent: (daysBetween(windowStart, mes) / totalDias) * 100,
    }
  })

  const hojePercent = (daysBetween(windowStart, hoje) / totalDias) * 100

  const itensNaJanela = ferias
    .map((item) => ({ ...item, statusAoVivo: computeFeriasStatus(item) }))
    .filter((item) => item.statusAoVivo !== StatusFerias.CANCELADA)
    .filter(
      (item) =>
        new Date(item.dataInicio) <= windowEnd &&
        new Date(item.dataFim) >= windowStart
    )

  const porDepartamento = new Map<string, typeof itensNaJanela>()
  for (const item of itensNaJanela) {
    const departamento = item.funcionario.departamento
    const grupo = porDepartamento.get(departamento) ?? []
    grupo.push(item)
    porDepartamento.set(departamento, grupo)
  }
  const departamentos = Array.from(porDepartamento.keys()).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <CalendarRange className="size-4 text-muted-foreground" />
          Ausências por departamento — próximos {JANELA_EM_MESES} meses
        </CardTitle>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {STATUS_LEGEND.map((item) => (
            <span key={item.status} className="flex items-center gap-1.5">
              <span
                className={cn("size-2 rounded-full", STATUS_BAR_CLASS[item.status])}
              />
              {item.label}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {departamentos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma ausência prevista para o período.
          </p>
        ) : (
          <div className="space-y-6">
            <div className="relative ml-44 h-5 border-b border-border text-xs text-muted-foreground">
              {meses.map((mes) => (
                <span
                  key={mes.label}
                  className="absolute capitalize"
                  style={{ left: `${mes.leftPercent}%` }}
                >
                  {mes.label}
                </span>
              ))}
            </div>

            {departamentos.map((departamento) => (
              <div key={departamento} className="space-y-2">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {departamento}
                </p>
                {porDepartamento.get(departamento)!.map((item) => {
                  const inicio = new Date(item.dataInicio)
                  const fim = new Date(item.dataFim)
                  const barStart = inicio < windowStart ? windowStart : inicio
                  const barEnd = fim > windowEnd ? windowEnd : fim
                  const leftPercent = (daysBetween(windowStart, barStart) / totalDias) * 100
                  const widthPercent =
                    ((daysBetween(barStart, barEnd) + 1) / totalDias) * 100

                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="w-44 shrink-0 truncate text-sm">
                        {item.funcionario.nome}
                      </span>
                      <div className="relative h-6 flex-1 rounded-md bg-muted">
                        <div
                          className="absolute top-0 bottom-0 w-px bg-foreground/25"
                          style={{ left: `${hojePercent}%` }}
                        />
                        <div
                          className={cn(
                            "absolute top-1 bottom-1 rounded-full",
                            STATUS_BAR_CLASS[item.statusAoVivo]
                          )}
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                          }}
                          title={`${dateFormatter.format(inicio)} – ${dateFormatter.format(fim)}`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
