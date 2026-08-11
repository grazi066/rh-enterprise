import { prisma } from "@/lib/prisma"
import { reconcileAllFuncionarioStatusFerias } from "@/lib/sync-funcionario-ferias-status"
import { AgendarFeriasDialog } from "./agendar-ferias-dialog"
import { FeriasTable } from "./ferias-table"
import { FeriasTimeline } from "./ferias-timeline"
import type { FeriasDTO, FuncionarioOption } from "./types"

export default async function FeriasPage() {
  // Sem cron neste projeto: reconcilia o status dos colaboradores (FERIAS
  // vs. ATIVO) toda vez que esta página é aberta, cobrindo períodos que
  // terminaram sozinhos desde a última visita — ver o módulo importado.
  await reconcileAllFuncionarioStatusFerias()

  const [ferias, funcionarios] = await Promise.all([
    prisma.ferias.findMany({
      orderBy: { dataInicio: "desc" },
      include: { funcionario: { include: { cargo: true } } },
    }),
    prisma.funcionario.findMany({
      where: { status: { not: "DESLIGADO" } },
      orderBy: { nome: "asc" },
      include: { cargo: true },
    }),
  ])

  const feriasDTO: FeriasDTO[] = ferias.map((item) => ({
    id: item.id,
    dataInicio: item.dataInicio.toISOString(),
    dataFim: item.dataFim.toISOString(),
    dias: item.dias,
    status: item.status,
    funcionario: {
      id: item.funcionario.id,
      nome: item.funcionario.nome,
      departamento: item.funcionario.cargo.departamento,
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
            Férias e Ausências
          </h1>
          <p className="text-sm text-muted-foreground">
            {feriasDTO.length}{" "}
            {feriasDTO.length === 1 ? "período registrado" : "períodos registrados"}.
          </p>
        </div>
        <AgendarFeriasDialog funcionarios={funcionariosDTO} />
      </div>

      <FeriasTimeline ferias={feriasDTO} />

      <FeriasTable ferias={feriasDTO} />
    </div>
  )
}
