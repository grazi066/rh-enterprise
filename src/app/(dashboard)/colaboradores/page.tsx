import { prisma } from "@/lib/prisma"
import { reconcileAllFuncionarioStatusFerias } from "@/lib/sync-funcionario-ferias-status"
import { FuncionariosTable } from "./funcionarios-table"
import type { FuncionarioDTO } from "./types"

export default async function ColaboradoresPage() {
  // Mesma reconciliação de /ferias — garante que o badge de status aqui
  // não fique preso em FERIAS depois que o período já terminou sozinho.
  await reconcileAllFuncionarioStatusFerias()

  const [funcionarios, cargos, beneficios] = await Promise.all([
    prisma.funcionario.findMany({
      orderBy: { nome: "asc" },
      include: {
        cargo: true,
        beneficios: { include: { beneficio: true } },
        historicoSalarios: { orderBy: { dataAlteracao: "desc" } },
      },
    }),
    prisma.cargo.findMany({ orderBy: { nome: "asc" } }),
    prisma.beneficio.findMany({ orderBy: { nome: "asc" } }),
  ])

  const funcionariosDTO: FuncionarioDTO[] = funcionarios.map((funcionario) => ({
    id: funcionario.id,
    nome: funcionario.nome,
    email: funcionario.email,
    cpf: funcionario.cpf,
    dataAdmissao: funcionario.dataAdmissao.toISOString(),
    status: funcionario.status,
    salarioAtual: funcionario.salarioAtual.toNumber(),
    cargo: {
      id: funcionario.cargo.id,
      nome: funcionario.cargo.nome,
      departamento: funcionario.cargo.departamento,
      salarioBase: funcionario.cargo.salarioBase.toNumber(),
    },
    beneficios: funcionario.beneficios.map((item) => ({
      beneficioId: item.beneficioId,
      valorCustomizado: item.valorCustomizado?.toNumber() ?? null,
      beneficio: {
        id: item.beneficio.id,
        nome: item.beneficio.nome,
        tipo: item.beneficio.tipo,
        valorPadrao: item.beneficio.valorPadrao.toNumber(),
      },
    })),
    historicoSalarios: funcionario.historicoSalarios.map((item) => ({
      id: item.id,
      valor: item.valor.toNumber(),
      motivo: item.motivo,
      dataAlteracao: item.dataAlteracao.toISOString(),
    })),
  }))

  const cargosDTO = cargos.map((cargo) => ({
    id: cargo.id,
    nome: cargo.nome,
    departamento: cargo.departamento,
    salarioBase: cargo.salarioBase.toNumber(),
  }))

  const beneficiosDTO = beneficios.map((beneficio) => ({
    id: beneficio.id,
    nome: beneficio.nome,
    tipo: beneficio.tipo,
    valorPadrao: beneficio.valorPadrao.toNumber(),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Colaboradores
        </h1>
        <p className="text-sm text-muted-foreground">
          {funcionariosDTO.length}{" "}
          {funcionariosDTO.length === 1
            ? "colaborador cadastrado"
            : "colaboradores cadastrados"}
          .
        </p>
      </div>

      <FuncionariosTable
        funcionarios={funcionariosDTO}
        cargos={cargosDTO}
        beneficios={beneficiosDTO}
      />
    </div>
  )
}
