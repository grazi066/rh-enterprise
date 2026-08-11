import { Building2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { CargoCard } from "./cargo-card"
import { CargoFormDialog } from "./cargo-form-dialog"

export default async function CargosPage() {
  const cargos = await prisma.cargo.findMany({
    orderBy: [{ departamento: "asc" }, { nome: "asc" }],
    include: { _count: { select: { funcionarios: true } } },
  })

  const cargosDTO = cargos.map((cargo) => ({
    id: cargo.id,
    nome: cargo.nome,
    departamento: cargo.departamento,
    salarioBase: cargo.salarioBase.toNumber(),
    funcionariosCount: cargo._count.funcionarios,
  }))

  const departamentos = Array.from(
    new Set(cargosDTO.map((cargo) => cargo.departamento))
  ).sort((a, b) => a.localeCompare(b, "pt-BR"))

  const grupos = departamentos.map((departamento) => ({
    departamento,
    cargos: cargosDTO.filter((cargo) => cargo.departamento === departamento),
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
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Building2 className="size-3.5" />
                </div>
                <h2 className="text-sm font-semibold">
                  {grupo.departamento}
                </h2>
                <span className="text-xs text-muted-foreground">
                  ({grupo.cargos.length})
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grupo.cargos.map((cargo) => (
                  <CargoCard
                    key={cargo.id}
                    cargo={cargo}
                    departamentosExistentes={departamentos}
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
