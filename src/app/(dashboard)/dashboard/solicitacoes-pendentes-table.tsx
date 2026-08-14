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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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
            const isRowPending = isPending && pending?.id === solicitacao.id

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
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
