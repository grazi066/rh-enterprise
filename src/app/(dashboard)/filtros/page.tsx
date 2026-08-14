import { CalendarClock, HeartHandshake, Users, Wallet } from "lucide-react"

import { prisma } from "@/lib/prisma"
import { currencyFormatter } from "@/lib/format"
import { MetricCard } from "@/components/metric-card"
import { StatusFerias } from "@/generated/prisma/enums"
import { FiltrosClient } from "./filtros-client"
import type { FuncionarioFiltroDTO } from "./types"

export default async function FiltrosPage() {
  const hoje = new Date()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const fimMes = new Date(
    hoje.getFullYear(),
    hoje.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  )

  const [
    totalColaboradores,
    folhaSalarial,
    feriasNoMes,
    associacoesBeneficio,
    funcionarios,
  ] = await Promise.all([
    prisma.funcionario.count(),
    prisma.funcionario.aggregate({
      where: { status: { not: "DESLIGADO" } },
      _sum: { salarioAtual: true },
    }),
    prisma.ferias.findMany({
      where: {
        status: { not: StatusFerias.CANCELADA },
        dataInicio: { lte: fimMes },
        dataFim: { gte: inicioMes },
      },
      select: { funcionarioId: true },
      distinct: ["funcionarioId"],
    }),
    prisma.funcionarioBeneficio.findMany({
      where: { funcionario: { status: { not: "DESLIGADO" } } },
      select: {
        valorCustomizado: true,
        beneficio: { select: { valorPadrao: true } },
      },
    }),
    prisma.funcionario.findMany({
      orderBy: { nome: "asc" },
      include: { cargo: true },
    }),
  ])

  const folhaSalarialTotal = folhaSalarial._sum.salarioAtual?.toNumber() ?? 0
  const custoTotalBeneficios = associacoesBeneficio.reduce(
    (total, item) =>
      total + (item.valorCustomizado?.toNumber() ?? item.beneficio.valorPadrao.toNumber()),
    0
  )

  const funcionariosDTO: FuncionarioFiltroDTO[] = funcionarios.map((funcionario) => ({
    id: funcionario.id,
    nome: funcionario.nome,
    cpf: funcionario.cpf,
    email: funcionario.email,
    status: funcionario.status,
    salarioAtual: funcionario.salarioAtual.toNumber(),
    dataAdmissao: funcionario.dataAdmissao.toISOString(),
    cargo: {
      id: funcionario.cargo.id,
      nome: funcionario.cargo.nome,
      departamento: funcionario.cargo.departamento,
    },
  }))

  const departamentos = Array.from(
    new Set(funcionariosDTO.map((funcionario) => funcionario.cargo.departamento))
  ).sort((a, b) => a.localeCompare(b, "pt-BR"))

  const cargosMap = new Map<string, string>()
  for (const funcionario of funcionariosDTO) {
    cargosMap.set(
      funcionario.cargo.id,
      `${funcionario.cargo.nome} · ${funcionario.cargo.departamento}`
    )
  }
  const cargos = Array.from(cargosMap.entries())
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Filtros Avançados e Métricas
        </h1>
        <p className="text-sm text-muted-foreground">
          Visão consolidada do quadro de colaboradores, com filtros
          combinados em tempo real.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total de Colaboradores"
          value={totalColaboradores.toString()}
          icon={Users}
          className="border-slate-300 bg-slate-100/70"
          valueClassName="text-slate-900"
        />
        <MetricCard
          label="Folha Salarial Total Mensal"
          value={currencyFormatter.format(folhaSalarialTotal)}
          icon={Wallet}
          hint="Exclui colaboradores desligados"
          className="border-emerald-200/60 bg-emerald-50/60"
          valueClassName="text-emerald-700"
        />
        <MetricCard
          label="Em Férias no Mês Atual"
          value={feriasNoMes.length.toString()}
          icon={CalendarClock}
          className="border-red-200/60 bg-red-50/60"
          valueClassName="text-red-700"
        />
        <MetricCard
          label="Custo Total de Benefícios"
          value={currencyFormatter.format(custoTotalBeneficios)}
          icon={HeartHandshake}
          hint="Soma de todas as adesões ativas"
          className="border-blue-200/60 bg-blue-50/60"
          valueClassName="text-blue-700"
        />
      </div>

      <FiltrosClient
        funcionarios={funcionariosDTO}
        departamentos={departamentos}
        cargos={cargos}
      />
    </div>
  )
}
