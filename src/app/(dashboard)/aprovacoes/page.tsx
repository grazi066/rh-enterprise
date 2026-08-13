import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { STATUS_SOLICITACAO_TO_APPROVAL_STATUS } from "@/lib/status-labels"
import { SolicitacoesTable } from "./solicitacoes-table"
import type { SolicitacaoDTO } from "./types"

export default async function AprovacoesPage() {
  const solicitacoes = await prisma.solicitacao.findMany({
    orderBy: { createdAt: "desc" },
    include: { funcionario: { select: { id: true, nome: true } } },
  })

  const solicitacoesDTO: SolicitacaoDTO[] = solicitacoes.map((solicitacao) => ({
    id: solicitacao.id,
    tipo: solicitacao.tipo,
    status: STATUS_SOLICITACAO_TO_APPROVAL_STATUS[solicitacao.status],
    createdAt: solicitacao.createdAt.toISOString(),
    funcionario: {
      id: solicitacao.funcionario.id,
      nome: solicitacao.funcionario.nome,
    },
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Aprovações</h1>
        <p className="text-sm text-muted-foreground">
          Solicitações de colaboradores aguardando ou já revisadas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          <SolicitacoesTable solicitacoes={solicitacoesDTO} />
        </CardContent>
      </Card>
    </div>
  )
}
