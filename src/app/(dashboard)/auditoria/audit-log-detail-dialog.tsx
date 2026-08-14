"use client"

import { useState } from "react"
import { Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AcaoAuditoriaBadge } from "@/components/audit-acao-badge"
import { formatAuditDetails, getAuditJustificativa } from "./format-audit-details"
import type { AuditLogDTO } from "./types"

const dataHoraCompletaFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "medium",
})

function formatarDetalhesBrutos(detalhes: string | null) {
  if (!detalhes) return null
  try {
    return JSON.stringify(JSON.parse(detalhes), null, 2)
  } catch {
    return detalhes
  }
}

export function AuditLogDetailDialog({ log }: { log: AuditLogDTO }) {
  const [open, setOpen] = useState(false)

  const resumo = formatAuditDetails(log.acao, log.detalhes)
  const justificativa = getAuditJustificativa(log.detalhes)
  const detalhesBrutos = formatarDetalhesBrutos(log.detalhes)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Ver detalhes completos do registro"
        onClick={() => setOpen(true)}
      >
        <Eye className="size-3.5" />
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Registro de Auditoria</DialogTitle>
        </DialogHeader>

        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Data/Hora</dt>
            <dd className="font-medium">
              {dataHoraCompletaFormatter.format(new Date(log.createdAt))}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Usuário/Ator</dt>
            <dd className="font-medium">{log.usuarioNome ?? "Sistema"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Tipo de Ação</dt>
            <dd>
              <AcaoAuditoriaBadge acao={log.acao} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Entidade/ID</dt>
            <dd className="font-medium break-all">
              {log.entidade}
              {log.entidadeId && (
                <span className="text-muted-foreground"> #{log.entidadeId}</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="space-y-2 border-t pt-4">
          <p className="text-xs text-muted-foreground">Detalhes</p>
          <p className="text-sm">{resumo}</p>
          {justificativa && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Justificativa:</span>{" "}
              {justificativa}
            </p>
          )}
          {detalhesBrutos && (
            <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap text-muted-foreground">
              {detalhesBrutos}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
