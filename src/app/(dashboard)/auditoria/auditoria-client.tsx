"use client"

import { useMemo, useState } from "react"
import { FileJson } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ColoredAvatar } from "@/components/colored-avatar"
import { AcaoAuditoriaBadge, acaoAuditoriaLabel } from "@/components/audit-acao-badge"
import type { AuditLogDTO } from "./types"

function formatarDetalhes(detalhes: string | null) {
  if (!detalhes) return null
  try {
    return JSON.stringify(JSON.parse(detalhes), null, 2)
  } catch {
    return detalhes
  }
}

function resumoDetalhes(detalhes: string | null) {
  if (!detalhes) return "—"
  const formatado = formatarDetalhes(detalhes) ?? detalhes
  const linhaUnica = formatado.replace(/\s+/g, " ").trim()
  return linhaUnica.length > 70 ? `${linhaUnica.slice(0, 70)}…` : linhaUnica
}

export function AuditoriaClient({ logs }: { logs: AuditLogDTO[] }) {
  const [busca, setBusca] = useState("")
  const [filtroAcao, setFiltroAcao] = useState("todas")

  const acaoOptions = useMemo(() => {
    const acoesUnicas = Array.from(new Set(logs.map((log) => log.acao)))
    return [
      { value: "todas", label: "Todas as ações" },
      ...acoesUnicas.map((acao) => ({ value: acao, label: acaoAuditoriaLabel(acao) })),
    ]
  }, [logs])

  const logsFiltrados = useMemo(() => {
    const buscaNormalizada = busca.trim().toLowerCase()
    return logs.filter((log) => {
      if (filtroAcao !== "todas" && log.acao !== filtroAcao) return false
      if (buscaNormalizada) {
        const alvo = [log.usuarioNome, log.acao, log.entidade, log.entidadeId, log.detalhes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        if (!alvo.includes(buscaNormalizada)) return false
      }
      return true
    })
  }, [logs, busca, filtroAcao])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por usuário, ação, entidade ou detalhes..."
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          className="w-72"
        />
        <Select value={filtroAcao} onValueChange={(value) => setFiltroAcao(value ?? "todas")}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {acaoOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {logsFiltrados.length} de {logs.length} registro(s)
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logsFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                  Nenhum registro corresponde aos filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              logsFiltrados.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ColoredAvatar name={log.usuarioNome ?? "Sistema"} className="size-7" />
                      <span className="font-medium">{log.usuarioNome ?? "Sistema"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <AcaoAuditoriaBadge acao={log.acao} />
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{log.entidade}</span>
                    {log.entidadeId && (
                      <span className="ml-1 text-xs text-muted-foreground/70">
                        #{log.entidadeId.slice(-8)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {log.detalhes ? (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <FileJson className="size-3.5 shrink-0" />
                              <span className="truncate">{resumoDetalhes(log.detalhes)}</span>
                            </span>
                          }
                        />
                        <TooltipContent className="max-w-sm whitespace-pre-wrap font-mono text-xs">
                          {formatarDetalhes(log.detalhes)}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
