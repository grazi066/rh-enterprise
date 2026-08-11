# RH Enterprise

Boilerplate de uma plataforma corporativa de gestão de Recursos Humanos, construída com **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4** e **shadcn/ui**, sobre um Design System próprio (Indigo/Violeta + Slate/Zinc — sem preto/branco/cinza puro). Os módulos de negócio são 100% ligados a um banco **PostgreSQL (Neon)** via **Prisma ORM 7**.

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

Como o schema Postgres deste projeto vive isolado em `rh` (banco compartilhado com outros projetos), migrations são aplicadas com `prisma migrate deploy`, não `migrate dev` — ver `CLAUDE.md` para detalhes de infraestrutura.

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
  components/
    ui/                  # componentes shadcn/ui
    layout/               # sidebar, topbar, navegação
  lib/
    prisma.ts            # singleton do PrismaClient
```

Para detalhes de arquitetura, convenções do Design System e decisões técnicas do stack (Prisma 7, TanStack Table v9, Next.js 16, base-ui), veja `CLAUDE.md`.

## Licença

Projeto de demonstração / boilerplate. Sem licença definida.
