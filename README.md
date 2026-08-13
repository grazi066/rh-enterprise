# RH Enterprise

Boilerplate de uma plataforma corporativa de gestão de Recursos Humanos, construída com **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4** e **shadcn/ui**, sobre um Design System próprio (Indigo/Violeta + Slate/Zinc — sem preto/branco/cinza puro). Os módulos de negócio são 100% ligados a um banco **PostgreSQL (Neon)** via **Prisma ORM 7**.

Layout responsivo (mobile e tablet friendly): sidebar retrátil em drawer abaixo do breakpoint `md`, tabelas com rolagem horizontal e grids de métricas que se reorganizam por tamanho de tela.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack, React Server Components, Server Actions) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS v4 (tokens via `@theme inline`, sem `tailwind.config.js`) |
| Componentes | [shadcn/ui](https://ui.shadcn.com) (`style: new-york`, base [`@base-ui/react`](https://base-ui.com)) |
| Tabelas | [TanStack Table v9](https://tanstack.com/table) |
| Ícones | [lucide-react](https://lucide.dev) |
| ORM | [Prisma ORM 7](https://www.prisma.io) com driver adapter `@prisma/adapter-pg` |
| Banco de dados | PostgreSQL via [Neon](https://neon.tech), isolado no schema `rh` |

## Módulos de RH

Todos os módulos abaixo são Server Components + Server Actions ligados diretamente ao Prisma (sem mock-data), com revalidação de cache automática após cada mutação:

- **Colaboradores** — cadastro completo (dados pessoais, vínculo profissional, benefícios), histórico salarial automático e busca/ordenação/paginação via TanStack Table.
- **Cargos e Departamentos** — CRUD de cargos, agrupados por departamento.
- **Benefícios** — catálogo de benefícios por tipo (Saúde, VR, VT, Previdência, Seguro de Vida, Gympass, Vale Cultura...), com valor customizável por colaborador.
- **Férias e Ausências** — agendamento com validação de sobreposição de período, cancelamento, timeline por departamento e **sincronização automática de status**: agendar/cancelar férias atualiza `Funcionario.status` (`ATIVO` ↔ `FÉRIAS`) em tempo real, refletido tanto na listagem de Colaboradores quanto nos KPIs da Visão Geral.
- **Folha de Pagamento** — geração de folha por período, edição de proventos/descontos, "Marcar como Pago" (individual ou em lote), com status derivado automaticamente (Pendente → Processando → Pago).
- **Filtros e Métricas** — página somente leitura com KPIs agregados do quadro inteiro (folha salarial, custo de benefícios, colaboradores ativos/em férias) e uma tabela filtrável (departamento, cargo, status, faixa salarial, período de admissão) com exportação para CSV.
- **Auditoria & Segurança** — trilha de auditoria (Audit Log) das ações sensíveis da plataforma, com busca por texto e filtro por ação; ver seção própria abaixo.

## Segurança, LGPD & Trilha de Auditoria (Audit Log)

O RH lida com dados pessoais e financeiros (salário, CPF, status de vínculo),
então toda ação que altera esse tipo de dado sensível é registrada numa
trilha de auditoria imutável, além de já contar com uma modelagem de papéis
(RBAC) pronta para restringir acesso por perfil.

- **`Role`** (`ADMIN` / `GESTOR` / `COLABORADOR`) — enum de papel de acesso,
  hoje presente como o campo `Funcionario.role` (`@default(ADMIN)`) na
  modelagem do banco. É a base para RBAC (controle de acesso por perfil);
  este boilerplate ainda não tem autenticação real, então o campo existe no
  schema mas nenhuma tela restringe ações por papel ainda — ver `role` em
  `prisma/schema.prisma`.
- **`AuditLog`** — tabela de auditoria (`rh.audit_logs`) que guarda quem fez
  o quê, quando e com quais valores antes/depois. Populada pelo helper
  `registrarAuditLog()` (`src/lib/audit.ts`), nunca editada manualmente.
  Ações registradas hoje:
  - `ALTERACAO_SALARIO`, `ALTERACAO_CARGO`, `ALTERACAO_STATUS` — disparadas
    de `colaboradores/actions.ts` (`updateFuncionario`) sempre que o
    respectivo campo muda numa edição de colaborador, com valor anterior e
    novo em `detalhes` (JSON serializado).
  - `APROVACAO_FERIAS`, `CANCELAMENTO_FERIAS` — disparadas de
    `ferias/actions.ts` (`createFerias`/`cancelFerias`), com o período e o
    colaborador afetado.
  - `PAGAMENTO_FOLHA` — disparada de `folha/actions.ts`
    (`marcarItemComoPago` e `processarFolhaCompleta`, no pagamento individual
    e em lote), com o valor líquido e a data do pagamento.
  - `EXCLUSAO_COLABORADOR` — disparada de `colaboradores/actions.ts`
    (`deleteFuncionario`) ao excluir um cadastro.
  - Como o projeto ainda não tem autenticação real, `usuarioNome` cai para
    o usuário mock do topbar (`currentUser` em `lib/mock-data.ts`) quando o
    chamador não informa quem agiu; `usuarioId` fica `null` até existir uma
    sessão de verdade.
- **`/auditoria`** — tela somente leitura (rota `app/(dashboard)/auditoria/`)
  com a trilha completa: Data/Hora, Usuário, Ação, Entidade e Detalhes (JSON
  pretty-printed em tooltip), com busca por texto livre e filtro por ação.
  Acessível pelo item "Auditoria & Segurança" na sidebar.

Nenhuma dessas ações é reversível pela UI (não existe "editar"/"excluir" um
`AuditLog`) — é, por design, um registro histórico, no mesmo espírito do
`HistoricoSalario` e do `ItemFolha` já pago.

## Layout responsivo (Mobile & Tablet Friendly)

Todo o shell autenticado (`app/(dashboard)/layout.tsx`) e os módulos de
negócio são pensados para funcionar em celulares e tablets, não só em
desktop:

- **Sidebar retrátil** — abaixo do breakpoint `md`, a sidebar fixa vira um
  menu hambúrguer no topbar que abre um drawer (`Sheet` do shadcn/ui) com a
  mesma navegação, fechado automaticamente ao trocar de rota
  (`components/layout/mobile-sidebar.tsx`).
- **Tabelas com rolagem horizontal** — o componente base `Table`
  (`components/ui/table.tsx`) já envolve toda tabela num container
  `overflow-x-auto`, então Colaboradores, Folha, Férias, Auditoria e
  Filtros permanecem legíveis em telas estreitas sem quebrar o layout.
- **Grids de métricas responsivas** — os cards de KPI (Visão Geral, Filtros,
  Folha, Auditoria, Cargos, Benefícios) usam
  `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (ou variação equivalente),
  empilhando em uma coluna no celular e expandindo em telas maiores.

## Rodando localmente

```bash
npm install

# variáveis de ambiente (ver seção abaixo)
cp .env.example .env   # se existir; caso contrário, crie .env com DATABASE_URL

npx prisma generate     # gera o client em src/generated/prisma
npx prisma migrate deploy
npx prisma db seed      # popula dados fictícios de desenvolvimento

npm run dev              # http://localhost:3000
```

Outros comandos úteis:

```bash
npm run build     # build de produção (Turbopack)
npm run lint       # ESLint
npx tsc --noEmit   # type-check isolado
npx prisma studio  # GUI do banco
```

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do Postgres (Neon), usada pelo Prisma via driver adapter. Ex.: `postgresql://user:password@host/db?sslmode=require` |

> Este projeto usa Prisma 7 com driver adapters — não há mais engine binário embutido, então `DATABASE_URL` é obrigatória tanto em desenvolvimento quanto em produção (Vercel).

## Deploy

O projeto é otimizado para deploy na [Vercel](https://vercel.com):

1. Importe o repositório no [painel da Vercel](https://vercel.com/new) (framework detectado automaticamente: Next.js).
2. Configure a variável de ambiente `DATABASE_URL` apontando para o banco Neon de produção.
3. Deploy — a Vercel roda `npm run build` automaticamente.

Como o schema Postgres deste projeto vive isolado em `rh` (banco compartilhado com outros projetos), migrations são aplicadas com `prisma migrate deploy`, não `migrate dev`.

## Estrutura do projeto

```
prisma/
  schema.prisma       # modelagem do banco
  seed.ts               # dados fictícios de desenvolvimento
src/
  app/
    (dashboard)/         # shell autenticado (sidebar + topbar)
      dashboard/           # Visão Geral (KPIs + solicitações recentes)
      colaboradores/        # Colaboradores + Histórico Salarial
      cargos/                # Cargos e Departamentos
      beneficios/             # Benefícios
      ferias/                  # Férias e Ausências
      folha/                    # Folha de Pagamento
      filtros/                   # Filtros Avançados e Métricas
      auditoria/                  # Auditoria & Segurança (Audit Log)
  components/
    ui/                  # componentes shadcn/ui
    layout/               # sidebar, topbar, navegação, drawer mobile
  lib/
    prisma.ts            # singleton do PrismaClient
    audit.ts              # registrarAuditLog() — grava na tabela AuditLog
    revalidate.ts          # revalidateAppPaths() — revalida as rotas afetadas após cada mutação
```

## Licença

Projeto de demonstração / boilerplate. Sem licença definida.
