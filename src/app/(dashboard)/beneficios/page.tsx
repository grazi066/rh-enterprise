import { HeartHandshake, Wallet } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { MetricCard } from "@/components/metric-card"
import { prisma } from "@/lib/prisma"
import { currencyFormatter } from "@/lib/format"
import { BeneficioCard } from "./beneficio-card"
import { BeneficioFormDialog } from "./beneficio-form-dialog"

export default async function BeneficiosPage() {
  const beneficios = await prisma.beneficio.findMany({
    orderBy: { nome: "asc" },
  })

  const beneficiosDTO = beneficios.map((beneficio) => ({
    id: beneficio.id,
    nome: beneficio.nome,
    tipo: beneficio.tipo,
    valorPadrao: beneficio.valorPadrao.toNumber(),
  }))

  const valorTotalPadrao = beneficiosDTO.reduce(
    (total, beneficio) => total + beneficio.valorPadrao,
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Benefícios
          </h1>
          <p className="text-sm text-muted-foreground">
            {beneficiosDTO.length}{" "}
            {beneficiosDTO.length === 1
              ? "benefício cadastrado"
              : "benefícios cadastrados"}{" "}
            no catálogo.
          </p>
        </div>
        <BeneficioFormDialog mode="create" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          label="Total de Benefícios"
          value={beneficiosDTO.length.toString()}
          icon={HeartHandshake}
          highlight
        />
        <MetricCard
          label="Soma dos Valores Padrão"
          value={currencyFormatter.format(valorTotalPadrao)}
          icon={Wallet}
          hint="Antes de customizações por colaborador"
        />
      </div>

      {beneficiosDTO.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhum benefício cadastrado ainda. Clique em &ldquo;Novo
            Benefício&rdquo; para começar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {beneficiosDTO.map((beneficio) => (
            <BeneficioCard key={beneficio.id} beneficio={beneficio} />
          ))}
        </div>
      )}
    </div>
  )
}
