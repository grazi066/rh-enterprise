import { Briefcase, Building2, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MetricCard } from "@/components/metric-card"
import { prisma } from "@/lib/prisma"
import { CargoCard } from "./cargo-card"
import { CargoFormDialog } from "./cargo-form-dialog"
import { ColaboradoresSheet, type ColaboradorListItem } from "./colaboradores-sheet"

export default async function CargosPage() {
  const [cargos, funcionarios] = await Promise.all([
    prisma.cargo.findMany({
      orderBy: [{ departamento: "asc" }, { nome: "asc" }],
    }),
    prisma.funcionario.findMany({
      orderBy: { nome: "asc" },
      include: { cargo: { select: { nome: true, departamento: true } } },
    }),
  ])

  const cargosDTO = cargos.map((cargo) => ({
    id: cargo.id,
    nome: cargo.nome,
    departamento: cargo.departamento,
    salarioBase: cargo.salarioBase.toNumber(),
  }))

  const departamentos = Array.from(
    new Set(cargosDTO.map((cargo) => cargo.departamento))
  ).sort((a, b) => a.localeCompare(b, "pt-BR"))

  // Fonte única de verdade para as listas de colaboradores exibidas nos
  // Sheets — tanto por departamento quanto por cargo — em vez de um mero
  // contador desconectado dos dados reais.
  const colaboradoresPorDepartamento = new Map<string, ColaboradorListItem[]>()
  const colaboradoresPorCargo = new Map<string, ColaboradorListItem[]>()
  for (const funcionario of funcionarios) {
    const item: ColaboradorListItem = {
      id: funcionario.id,
      nome: funcionario.nome,
      cargoNome: funcionario.cargo.nome,
      status: funcionario.status,
      salarioAtual: funcionario.salarioAtual.toNumber(),
    }

    const departamento = funcionario.cargo.departamento
    colaboradoresPorDepartamento.set(departamento, [
      ...(colaboradoresPorDepartamento.get(departamento) ?? []),
      item,
    ])

    colaboradoresPorCargo.set(funcionario.cargoId, [
      ...(colaboradoresPorCargo.get(funcionario.cargoId) ?? []),
      item,
    ])
  }

  const grupos = departamentos.map((departamento) => ({
    departamento,
    cargos: cargosDTO.filter((cargo) => cargo.departamento === departamento),
    colaboradores: colaboradoresPorDepartamento.get(departamento) ?? [],
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Cargos e Departamentos
          </h1>
          <p className="text-sm text-muted-foreground">
            {cargosDTO.length} {cargosDTO.length === 1 ? "cargo" : "cargos"}{" "}
            em {departamentos.length}{" "}
            {departamentos.length === 1 ? "departamento" : "departamentos"}.
          </p>
        </div>
        <CargoFormDialog mode="create" departamentosExistentes={departamentos} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total de Cargos"
          value={cargosDTO.length.toString()}
          icon={Briefcase}
          highlight
        />
        <MetricCard
          label="Departamentos"
          value={departamentos.length.toString()}
          icon={Building2}
          highlight
        />
        <MetricCard
          label="Colaboradores Vinculados"
          value={funcionarios.length.toString()}
          icon={Users}
          highlight
        />
      </div>

      {grupos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhum cargo cadastrado ainda. Clique em &ldquo;Novo Cargo&rdquo;
            para começar.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {grupos.map((grupo) => (
            <section key={grupo.departamento} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Building2 className="size-3.5" />
                </div>
                <h2 className="text-sm font-semibold">
                  {grupo.departamento}
                </h2>
                <span className="text-xs text-muted-foreground">
                  ({grupo.cargos.length})
                </span>
                <div className="ml-auto">
                  <ColaboradoresSheet
                    title={grupo.departamento}
                    emptyMessage="Nenhum colaborador vinculado a este departamento."
                    colaboradores={grupo.colaboradores}
                    trigger={
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Users className="size-3.5" />
                        Ver colaboradores
                      </Button>
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grupo.cargos.map((cargo) => (
                  <CargoCard
                    key={cargo.id}
                    cargo={cargo}
                    departamentosExistentes={departamentos}
                    colaboradores={colaboradoresPorCargo.get(cargo.id) ?? []}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
