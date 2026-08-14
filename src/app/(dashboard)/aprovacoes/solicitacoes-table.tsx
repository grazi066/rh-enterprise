"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { StatusBadge } from "@/components/status-badge"
import { TIPO_SOLICITACAO_LABEL } from "@/lib/status-labels"
import type { SolicitacaoDTO } from "./types"

const dateFormatter = new Intl.DateTimeFormat("pt-BR")

export function SolicitacoesTable({
  solicitacoes,
}: {
  solicitacoes: SolicitacaoDTO[]
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Colaborador</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Justificativa</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Status</TableHead>
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
          solicitacoes.map((solicitacao) => (
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
                <StatusBadge status={solicitacao.status} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
