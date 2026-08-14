"use client"

import { useState, useTransition } from "react"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { StatusBadge, type ApprovalStatus } from "@/components/status-badge"
import { TIPO_SOLICITACAO_LABEL } from "@/lib/status-labels"
import {
  aprovarSolicitacao,
  rejeitarSolicitacao,
} from "@/app/(dashboard)/aprovacoes/actions"
import type { SolicitacaoDTO } from "@/app/(dashboard)/aprovacoes/types"

const dateFormatter = new Intl.DateTimeFormat("pt-BR")

export function SolicitacoesPendentesTable({
  solicitacoes,
}: {
  solicitacoes: SolicitacaoDTO[]
}) {
  const [, startTransition] = useTransition()
  // Sobrepõe o status vindo do servidor assim que o usuário clica: os
  // botões viram badge na mesma renderização, antes mesmo da Server Action
  // responder. Não usamos router.refresh() depois — a query do dashboard só
  // traz solicitações PENDENTE, então um refresh removeria a linha em vez de
  // manter a badge visível.
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, ApprovalStatus>
  >({})

  function handleRevisar(solicitacao: SolicitacaoDTO, acao: "aprovar" | "rejeitar") {
    const statusOtimista: ApprovalStatus = acao === "aprovar" ? "aprovado" : "reprovado"
    setStatusOverrides((prev) => ({ ...prev, [solicitacao.id]: statusOtimista }))

    startTransition(async () => {
      const result =
        acao === "aprovar"
          ? await aprovarSolicitacao(solicitacao.id)
          : await rejeitarSolicitacao(solicitacao.id)

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
        setStatusOverrides((prev) => {
          const next = { ...prev }
          delete next[solicitacao.id]
          return next
        })
      }
    })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Colaborador</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Justificativa</TableHead>
          <TableHead>Data</TableHead>
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
              Nenhuma solicitação pendente no momento.
            </TableCell>
          </TableRow>
        ) : (
          solicitacoes.map((solicitacao) => {
            const status = statusOverrides[solicitacao.id] ?? solicitacao.status

            return (
              <TableRow key={solicitacao.id}>
                <TableCell className="font-medium">
                  {solicitacao.funcionario.nome}
                </TableCell>
                <TableCell>{TIPO_SOLICITACAO_LABEL[solicitacao.tipo]}</TableCell>
                <TableCell className="max-w-xs">
                  {solicitacao.justificativa ? (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="block truncate text-muted-foreground">
                            {solicitacao.justificativa}
                          </span>
                        }
                      />
                      <TooltipContent className="max-w-sm whitespace-pre-wrap text-xs">
                        {solicitacao.justificativa}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {dateFormatter.format(new Date(solicitacao.createdAt))}
                </TableCell>
                <TableCell className="text-right">
                  {status === "pendente" ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRevisar(solicitacao, "rejeitar")}
                      >
                        Rejeitar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRevisar(solicitacao, "aprovar")}
                      >
                        Aprovar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <StatusBadge status={status} />
                    </div>
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
