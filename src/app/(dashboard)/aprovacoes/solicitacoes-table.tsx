"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { TIPO_SOLICITACAO_LABEL } from "@/lib/status-labels"
import { aprovarSolicitacao, rejeitarSolicitacao } from "./actions"
import type { SolicitacaoDTO } from "./types"

const dateFormatter = new Intl.DateTimeFormat("pt-BR")

export function SolicitacoesTable({
  solicitacoes,
}: {
  solicitacoes: SolicitacaoDTO[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pending, setPending] = useState<{
    id: string
    acao: "aprovar" | "rejeitar"
  } | null>(null)

  function handleRevisar(solicitacao: SolicitacaoDTO, acao: "aprovar" | "rejeitar") {
    setPending({ id: solicitacao.id, acao })
    startTransition(async () => {
      const result =
        acao === "aprovar"
          ? await aprovarSolicitacao(solicitacao.id)
          : await rejeitarSolicitacao(solicitacao.id)

      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
      setPending(null)
    })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Colaborador</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {solicitacoes.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="h-24 text-center text-sm text-muted-foreground"
            >
              Nenhuma solicitação registrada ainda.
            </TableCell>
          </TableRow>
        ) : (
          solicitacoes.map((solicitacao) => {
            const isRowPending = isPending && pending?.id === solicitacao.id

            return (
              <TableRow key={solicitacao.id}>
                <TableCell className="font-medium">
                  {solicitacao.funcionario.nome}
                </TableCell>
                <TableCell>{TIPO_SOLICITACAO_LABEL[solicitacao.tipo]}</TableCell>
                <TableCell className="text-muted-foreground">
                  {dateFormatter.format(new Date(solicitacao.createdAt))}
                </TableCell>
                <TableCell>
                  <StatusBadge status={solicitacao.status} />
                </TableCell>
                <TableCell className="text-right">
                  {solicitacao.status === "pendente" ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isRowPending}
                        onClick={() => handleRevisar(solicitacao, "rejeitar")}
                      >
                        {isRowPending && pending?.acao === "rejeitar"
                          ? "Rejeitando..."
                          : "Rejeitar"}
                      </Button>
                      <Button
                        size="sm"
                        disabled={isRowPending}
                        onClick={() => handleRevisar(solicitacao, "aprovar")}
                      >
                        {isRowPending && pending?.acao === "aprovar"
                          ? "Aprovando..."
                          : "Aprovar"}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
