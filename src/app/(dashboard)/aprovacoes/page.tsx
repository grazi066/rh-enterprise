import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { STATUS_SOLICITACAO_TO_APPROVAL_STATUS } from "@/lib/status-labels"
import { NovaSolicitacaoDialog } from "./nova-solicitacao-dialog"
import { SolicitacoesTable } from "./solicitacoes-table"
import type { FuncionarioOption, SolicitacaoDTO } from "./types"

export default async function AprovacoesPage() {
  const [solicitacoes, funcionarios] = await Promise.all([
    prisma.solicitacao.findMany({
      orderBy: { createdAt: "desc" },
      include: { funcionario: { select: { id: true, nome: true } } },
    }),
    prisma.funcionario.findMany({
      where: { status: { not: "DESLIGADO" } },
      orderBy: { nome: "asc" },
      include: { cargo: true },
    }),
  ])

  const solicitacoesDTO: SolicitacaoDTO[] = solicitacoes.map((solicitacao) => ({
    id: solicitacao.id,
    tipo: solicitacao.tipo,
    status: STATUS_SOLICITACAO_TO_APPROVAL_STATUS[solicitacao.status],
    justificativa: solicitacao.justificativa,
    createdAt: solicitacao.createdAt.toISOString(),
    funcionario: {
      id: solicitacao.funcionario.id,
      nome: solicitacao.funcionario.nome,
    },
  }))

  const funcionariosDTO: FuncionarioOption[] = funcionarios.map((funcionario) => ({
    id: funcionario.id,
    nome: funcionario.nome,
    departamento: funcionario.cargo.departamento,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Solicitações e Aprovações
          </h1>
          <p className="text-sm text-muted-foreground">
            Solicitações de colaboradores aguardando ou já revisadas.
          </p>
        </div>
        <NovaSolicitacaoDialog funcionarios={funcionariosDTO} />
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
