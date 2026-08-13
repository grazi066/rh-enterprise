/**
 * Seed de dados fictícios do RH Enterprise.
 *
 * Roda contra o schema Postgres isolado "rh" (ver prisma/schema.prisma).
 * Reexecutável: limpa as tabelas de rh.* (nessa ordem, por causa das FKs) e
 * insere um conjunto variado de dados, cobrindo todos os valores dos enums
 * de status/tipo, para exercitar a UI (badges, filtros, tabelas).
 *
 * Uso: npx prisma db seed
 */
import "dotenv/config";
import { PrismaClient, TipoBeneficio, type Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function diasEntre(inicio: Date, fim: Date) {
  return Math.round((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function round2(valor: number) {
  return Math.round(valor * 100) / 100;
}

// Mesma taxa ilustrativa usada em app/(dashboard)/folha/actions.ts — não é
// cálculo real de INSS/IRRF, só dá substância às métricas na demo.
const TAXA_DESCONTO_ILUSTRATIVA = 0.11;

async function main() {
  console.log("Limpando tabelas do schema rh...");
  await prisma.solicitacao.deleteMany();
  await prisma.itemFolha.deleteMany();
  await prisma.folhaPagamento.deleteMany();
  await prisma.ferias.deleteMany();
  await prisma.historicoSalario.deleteMany();
  await prisma.funcionarioBeneficio.deleteMany();
  await prisma.funcionario.deleteMany();
  await prisma.beneficio.deleteMany();
  await prisma.cargo.deleteMany();

  console.log("Criando cargos...");
  const cargosData: Prisma.CargoCreateInput[] = [
    { nome: "Gerente de Recursos Humanos", departamento: "Recursos Humanos", salarioBase: 12000 },
    { nome: "Analista de RH Pleno", departamento: "Recursos Humanos", salarioBase: 5800 },
    { nome: "Desenvolvedor(a) Full Stack", departamento: "Tecnologia", salarioBase: 9500 },
    { nome: "Engenheiro(a) de Dados", departamento: "Tecnologia", salarioBase: 11000 },
    { nome: "Coordenador(a) Financeiro", departamento: "Financeiro", salarioBase: 8700 },
    { nome: "Analista Contábil", departamento: "Financeiro", salarioBase: 5200 },
    { nome: "Analista de Marketing", departamento: "Marketing", salarioBase: 5600 },
    { nome: "Executivo(a) de Vendas", departamento: "Vendas", salarioBase: 4800 },
    { nome: "Assistente Administrativo", departamento: "Operações", salarioBase: 3200 },
    { nome: "Advogado(a) Trabalhista", departamento: "Jurídico", salarioBase: 10500 },
  ];
  const cargos = await Promise.all(
    cargosData.map((data) => prisma.cargo.create({ data }))
  );
  const cargoPorNome = Object.fromEntries(cargos.map((c) => [c.nome, c]));

  console.log("Criando benefícios (um por tipo, para cobrir todas as variações)...");
  const beneficiosData: Prisma.BeneficioCreateInput[] = [
    { nome: "Plano de Saúde Premium", tipo: TipoBeneficio.SAUDE, valorPadrao: 450 },
    { nome: "Plano Odontológico Total", tipo: TipoBeneficio.ODONTOLOGICO, valorPadrao: 80 },
    { nome: "Vale Refeição", tipo: TipoBeneficio.VALE_REFEICAO, valorPadrao: 660 },
    { nome: "Vale Transporte", tipo: TipoBeneficio.VALE_TRANSPORTE, valorPadrao: 220 },
    { nome: "Previdência Privada", tipo: TipoBeneficio.PREVIDENCIA_PRIVADA, valorPadrao: 300 },
    { nome: "Seguro de Vida em Grupo", tipo: TipoBeneficio.SEGURO_DE_VIDA, valorPadrao: 45 },
    { nome: "Gympass Corporativo", tipo: TipoBeneficio.GYMPASS, valorPadrao: 120 },
    { nome: "Vale Cultura", tipo: TipoBeneficio.VALE_CULTURA, valorPadrao: 90 },
  ];
  const beneficios = await Promise.all(
    beneficiosData.map((data) => prisma.beneficio.create({ data }))
  );
  const beneficioPorNome = Object.fromEntries(beneficios.map((b) => [b.nome, b]));

  console.log("Criando funcionários (cobrindo ATIVO, FERIAS, AFASTADO e DESLIGADO)...");
  const funcionariosData = [
    { nome: "Ana Beatriz Souza", email: "ana.souza@rh-enterprise.com", cpf: "111.222.333-01", dataAdmissao: "2019-03-14", status: "ATIVO", cargo: "Gerente de Recursos Humanos", salarioAtual: 13200 },
    { nome: "Carlos Eduardo Lima", email: "carlos.lima@rh-enterprise.com", cpf: "111.222.333-02", dataAdmissao: "2019-08-01", status: "FERIAS", cargo: "Desenvolvedor(a) Full Stack", salarioAtual: 10200 },
    { nome: "Fernanda Ribeiro", email: "fernanda.ribeiro@rh-enterprise.com", cpf: "111.222.333-03", dataAdmissao: "2018-11-20", status: "AFASTADO", cargo: "Coordenador(a) Financeiro", salarioAtual: 9100 },
    { nome: "João Pedro Alves", email: "joao.alves@rh-enterprise.com", cpf: "111.222.333-04", dataAdmissao: "2022-01-10", status: "DESLIGADO", cargo: "Assistente Administrativo", salarioAtual: 3200 },
    { nome: "Mariana Costa", email: "mariana.costa@rh-enterprise.com", cpf: "111.222.333-05", dataAdmissao: "2020-05-22", status: "ATIVO", cargo: "Engenheiro(a) de Dados", salarioAtual: 11800 },
    { nome: "Rafael Santos Oliveira", email: "rafael.oliveira@rh-enterprise.com", cpf: "111.222.333-06", dataAdmissao: "2021-02-08", status: "ATIVO", cargo: "Analista de Marketing", salarioAtual: 5900 },
    { nome: "Juliana Pereira", email: "juliana.pereira@rh-enterprise.com", cpf: "111.222.333-07", dataAdmissao: "2017-09-05", status: "FERIAS", cargo: "Advogado(a) Trabalhista", salarioAtual: 12100 },
    { nome: "Bruno Henrique Martins", email: "bruno.martins@rh-enterprise.com", cpf: "111.222.333-08", dataAdmissao: "2023-04-17", status: "ATIVO", cargo: "Executivo(a) de Vendas", salarioAtual: 5000 },
    { nome: "Camila Fernandes", email: "camila.fernandes@rh-enterprise.com", cpf: "111.222.333-09", dataAdmissao: "2022-06-13", status: "ATIVO", cargo: "Analista de RH Pleno", salarioAtual: 6100 },
    { nome: "Thiago Almeida", email: "thiago.almeida@rh-enterprise.com", cpf: "111.222.333-10", dataAdmissao: "2020-10-01", status: "AFASTADO", cargo: "Desenvolvedor(a) Full Stack", salarioAtual: 9800 },
    { nome: "Larissa Gomes", email: "larissa.gomes@rh-enterprise.com", cpf: "111.222.333-11", dataAdmissao: "2021-07-19", status: "ATIVO", cargo: "Analista Contábil", salarioAtual: 5450 },
    { nome: "Pedro Henrique Barbosa", email: "pedro.barbosa@rh-enterprise.com", cpf: "111.222.333-12", dataAdmissao: "2019-12-02", status: "DESLIGADO", cargo: "Executivo(a) de Vendas", salarioAtual: 5100 },
    { nome: "Beatriz Cardoso", email: "beatriz.cardoso@rh-enterprise.com", cpf: "111.222.333-13", dataAdmissao: "2024-02-26", status: "ATIVO", cargo: "Coordenador(a) Financeiro", salarioAtual: 8700 },
    { nome: "Gustavo Rocha", email: "gustavo.rocha@rh-enterprise.com", cpf: "111.222.333-14", dataAdmissao: "2018-03-09", status: "FERIAS", cargo: "Engenheiro(a) de Dados", salarioAtual: 12500 },
  ] as const;

  const funcionarios = await Promise.all(
    funcionariosData.map((f) =>
      prisma.funcionario.create({
        data: {
          nome: f.nome,
          email: f.email,
          cpf: f.cpf,
          dataAdmissao: new Date(f.dataAdmissao),
          status: f.status,
          salarioAtual: f.salarioAtual,
          cargo: { connect: { id: cargoPorNome[f.cargo].id } },
        },
      })
    )
  );
  const funcionarioPorEmail = Object.fromEntries(funcionarios.map((f) => [f.email, f]));

  console.log("Associando benefícios (com alguns valores customizados)...");
  const listaBeneficios = Object.values(beneficioPorNome);
  const associacoes: Prisma.FuncionarioBeneficioCreateManyInput[] = [];
  for (const f of funcionarios) {
    if (f.status === "DESLIGADO") continue; // desligados não mantêm benefícios ativos

    // Todo mundo tem saúde + vale refeição + vale transporte; o resto varia.
    const base = [beneficioPorNome["Plano de Saúde Premium"], beneficioPorNome["Vale Refeição"], beneficioPorNome["Vale Transporte"]];
    const extrasDisponiveis = listaBeneficios.filter((b) => !base.includes(b));
    const qtdExtras = 1 + (f.nome.length % 3); // 1 a 3 extras, variando por nome
    const extras = extrasDisponiveis.slice(0, qtdExtras);

    for (const beneficio of [...base, ...extras]) {
      const customizavel = beneficio.nome === "Plano de Saúde Premium";
      associacoes.push({
        funcionarioId: f.id,
        beneficioId: beneficio.id,
        // Alguns colaboradores optam por um plano de saúde superior ao padrão.
        valorCustomizado:
          customizavel && f.salarioAtual.toNumber() > 10000
            ? beneficio.valorPadrao.toNumber() + 150
            : null,
      });
    }
  }
  await prisma.funcionarioBeneficio.createMany({ data: associacoes });

  console.log("Criando histórico salarial...");
  const historico: Prisma.HistoricoSalarioCreateManyInput[] = [
    { funcionarioId: funcionarioPorEmail["ana.souza@rh-enterprise.com"].id, valor: 9500, motivo: "Contratação", dataAlteracao: new Date("2019-03-14") },
    { funcionarioId: funcionarioPorEmail["ana.souza@rh-enterprise.com"].id, valor: 12000, motivo: "Promoção a Gerente", dataAlteracao: new Date("2022-04-01") },
    { funcionarioId: funcionarioPorEmail["ana.souza@rh-enterprise.com"].id, valor: 13200, motivo: "Reajuste anual (dissídio)", dataAlteracao: new Date("2025-05-01") },
    { funcionarioId: funcionarioPorEmail["carlos.lima@rh-enterprise.com"].id, valor: 8500, motivo: "Contratação", dataAlteracao: new Date("2019-08-01") },
    { funcionarioId: funcionarioPorEmail["carlos.lima@rh-enterprise.com"].id, valor: 10200, motivo: "Mérito", dataAlteracao: new Date("2024-08-01") },
    { funcionarioId: funcionarioPorEmail["mariana.costa@rh-enterprise.com"].id, valor: 9800, motivo: "Contratação", dataAlteracao: new Date("2020-05-22") },
    { funcionarioId: funcionarioPorEmail["mariana.costa@rh-enterprise.com"].id, valor: 11800, motivo: "Equiparação salarial", dataAlteracao: new Date("2023-11-15") },
    { funcionarioId: funcionarioPorEmail["juliana.pereira@rh-enterprise.com"].id, valor: 10000, motivo: "Contratação", dataAlteracao: new Date("2017-09-05") },
    { funcionarioId: funcionarioPorEmail["juliana.pereira@rh-enterprise.com"].id, valor: 12100, motivo: "Reajuste anual (dissídio)", dataAlteracao: new Date("2025-09-05") },
    { funcionarioId: funcionarioPorEmail["larissa.gomes@rh-enterprise.com"].id, valor: 4900, motivo: "Contratação", dataAlteracao: new Date("2021-07-19") },
    { funcionarioId: funcionarioPorEmail["larissa.gomes@rh-enterprise.com"].id, valor: 5450, motivo: "Mérito", dataAlteracao: new Date("2024-07-19") },
  ];
  await prisma.historicoSalario.createMany({ data: historico });

  console.log("Criando períodos de férias (cobrindo todos os status)...");
  const feriasData: Prisma.FeriasCreateManyInput[] = [
    // CONCLUIDA — já aconteceu
    (() => {
      const inicio = new Date("2026-01-05");
      const fim = new Date("2026-01-19");
      return {
        funcionarioId: funcionarioPorEmail["mariana.costa@rh-enterprise.com"].id,
        dataInicio: inicio,
        dataFim: fim,
        dias: diasEntre(inicio, fim),
        status: "CONCLUIDA",
      };
    })(),
    (() => {
      const inicio = new Date("2025-12-01");
      const fim = new Date("2025-12-20");
      return {
        funcionarioId: funcionarioPorEmail["rafael.oliveira@rh-enterprise.com"].id,
        dataInicio: inicio,
        dataFim: fim,
        dias: diasEntre(inicio, fim),
        status: "CONCLUIDA",
      };
    })(),
    // EM_ANDAMENTO — funcionários com status FERIAS
    (() => {
      const inicio = new Date("2026-08-03");
      const fim = new Date("2026-08-17");
      return {
        funcionarioId: funcionarioPorEmail["carlos.lima@rh-enterprise.com"].id,
        dataInicio: inicio,
        dataFim: fim,
        dias: diasEntre(inicio, fim),
        status: "EM_ANDAMENTO",
      };
    })(),
    (() => {
      const inicio = new Date("2026-07-28");
      const fim = new Date("2026-08-26");
      return {
        funcionarioId: funcionarioPorEmail["juliana.pereira@rh-enterprise.com"].id,
        dataInicio: inicio,
        dataFim: fim,
        dias: diasEntre(inicio, fim),
        status: "EM_ANDAMENTO",
      };
    })(),
    (() => {
      const inicio = new Date("2026-08-05");
      const fim = new Date("2026-08-14");
      return {
        funcionarioId: funcionarioPorEmail["gustavo.rocha@rh-enterprise.com"].id,
        dataInicio: inicio,
        dataFim: fim,
        dias: diasEntre(inicio, fim),
        status: "EM_ANDAMENTO",
      };
    })(),
    // AGENDADA — no futuro
    (() => {
      const inicio = new Date("2026-09-14");
      const fim = new Date("2026-09-28");
      return {
        funcionarioId: funcionarioPorEmail["ana.souza@rh-enterprise.com"].id,
        dataInicio: inicio,
        dataFim: fim,
        dias: diasEntre(inicio, fim),
        status: "AGENDADA",
      };
    })(),
    (() => {
      const inicio = new Date("2026-10-05");
      const fim = new Date("2026-10-19");
      return {
        funcionarioId: funcionarioPorEmail["bruno.martins@rh-enterprise.com"].id,
        dataInicio: inicio,
        dataFim: fim,
        dias: diasEntre(inicio, fim),
        status: "AGENDADA",
      };
    })(),
    (() => {
      const inicio = new Date("2026-11-02");
      const fim = new Date("2026-11-11");
      return {
        funcionarioId: funcionarioPorEmail["larissa.gomes@rh-enterprise.com"].id,
        dataInicio: inicio,
        dataFim: fim,
        dias: diasEntre(inicio, fim),
        status: "AGENDADA",
      };
    })(),
    // CANCELADA — estava agendada e foi cancelada
    (() => {
      const inicio = new Date("2026-08-24");
      const fim = new Date("2026-09-02");
      return {
        funcionarioId: funcionarioPorEmail["camila.fernandes@rh-enterprise.com"].id,
        dataInicio: inicio,
        dataFim: fim,
        dias: diasEntre(inicio, fim),
        status: "CANCELADA",
      };
    })(),
  ];
  await prisma.ferias.createMany({ data: feriasData });

  console.log("Criando solicitações (cobrindo PENDENTE, APROVADO e REPROVADO)...");
  const solicitacoesData: Prisma.SolicitacaoCreateManyInput[] = [
    {
      funcionarioId: funcionarioPorEmail["carlos.lima@rh-enterprise.com"].id,
      tipo: "FERIAS",
      status: "APROVADO",
      justificativa: "Férias de fim de ano, período já alinhado com o time.",
      createdAt: new Date("2026-08-01"),
    },
    {
      funcionarioId: funcionarioPorEmail["mariana.costa@rh-enterprise.com"].id,
      tipo: "AJUSTE_SALARIAL",
      status: "PENDENTE",
      justificativa: "Equiparação salarial após acúmulo de responsabilidades no time de Dados.",
      createdAt: new Date("2026-08-05"),
    },
    {
      funcionarioId: funcionarioPorEmail["joao.alves@rh-enterprise.com"].id,
      tipo: "REEMBOLSO",
      status: "PENDENTE",
      justificativa: "Reembolso de despesas com material de escritório (nota fiscal em anexo).",
      createdAt: new Date("2026-08-07"),
    },
    {
      funcionarioId: funcionarioPorEmail["fernanda.ribeiro@rh-enterprise.com"].id,
      tipo: "ALTERACAO_CARGO",
      status: "REPROVADO",
      justificativa: "Solicitação de promoção a Diretora Financeira — orçamento do trimestre não comporta.",
      createdAt: new Date("2026-07-29"),
    },
  ];
  await prisma.solicitacao.createMany({ data: solicitacoesData });

  console.log("Gerando folha de pagamento de 07/2026 (já totalmente paga)...");
  const funcionariosAtivos = funcionarios.filter((f) => f.status !== "DESLIGADO");
  const itensFolhaData = funcionariosAtivos.map((f) => {
    const salarioBase = f.salarioAtual.toNumber();
    // Duas pessoas recebem um ajuste manual (simulando edição pelo RH depois
    // de gerar a folha) para a UI mostrar um item que já foi customizado.
    const ajusteManual =
      f.email === "rafael.oliveira@rh-enterprise.com"
        ? 300 // bônus de performance
        : f.email === "bruno.martins@rh-enterprise.com"
          ? -150 // desconto extra por falta
          : 0;
    const salarioBruto = round2(salarioBase + Math.max(ajusteManual, 0));
    const descontos = round2(
      salarioBruto * TAXA_DESCONTO_ILUSTRATIVA + Math.max(-ajusteManual, 0)
    );
    const valorLiquido = round2(salarioBruto - descontos);
    const observacao =
      f.email === "rafael.oliveira@rh-enterprise.com"
        ? "Bônus de performance do trimestre."
        : f.email === "bruno.martins@rh-enterprise.com"
          ? "Desconto adicional por falta não justificada."
          : null;

    return {
      funcionarioId: f.id,
      salarioBruto,
      descontos,
      valorLiquido,
      status: "PAGO" as const,
      dataPagamento: new Date("2026-08-05"),
      observacao,
    };
  });
  const valorTotalFolha = round2(
    itensFolhaData.reduce((total, item) => total + item.valorLiquido, 0)
  );
  const folhaJulho = await prisma.folhaPagamento.create({
    data: {
      mes: 7,
      ano: 2026,
      status: "PAGO",
      valorTotal: valorTotalFolha,
      dataPagamento: new Date("2026-08-05"),
    },
  });
  await prisma.itemFolha.createMany({
    data: itensFolhaData.map((item) => ({ ...item, folhaId: folhaJulho.id })),
  });

  console.log("\nSeed concluído:");
  console.log(`  ${cargos.length} cargos`);
  console.log(`  ${beneficios.length} benefícios`);
  console.log(`  ${funcionarios.length} funcionários`);
  console.log(`  ${associacoes.length} associações de benefícios`);
  console.log(`  ${historico.length} registros de histórico salarial`);
  console.log(`  ${feriasData.length} períodos de férias`);
  console.log(`  ${solicitacoesData.length} solicitações`);
  console.log(`  1 folha de pagamento (07/2026) com ${itensFolhaData.length} itens`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
