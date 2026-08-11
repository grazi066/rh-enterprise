@AGENTS.md

# RH Enterprise

Boilerplate de uma plataforma corporativa de gestão de Recursos Humanos. Next.js
(App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui, com um Design System
próprio (não é o preto-e-branco padrão do shadcn).

## Stack

- **Next.js 16** (App Router, Turbopack, React Server Components)
- **TypeScript**
- **Tailwind CSS v4** (tokens via `@theme inline`, sem `tailwind.config.js`)
- **shadcn/ui** (`style: new-york`, base `base-ui`) — componentes vivem em
  `src/components/ui` e são código do projeto, não uma dependência de pacote
- **lucide-react** para ícones
- **Prisma ORM 7** + **PostgreSQL** (Neon), com driver adapter `@prisma/adapter-pg`
- **TanStack Table v9** (`@tanstack/react-table`) para a tabela de colaboradores —
  API bem diferente da v8, ver seção própria abaixo

## Comandos

```bash
npm run dev       # servidor de desenvolvimento (Turbopack) em http://localhost:3000
npm run build     # build de produção
npm run start     # sobe o build de produção
npm run lint      # ESLint
npx tsc --noEmit  # type-check isolado
```

Adicionar componentes shadcn novos (sempre não-interativo, com `-o` para
sobrescrever se já existir):

```bash
npx shadcn@latest add <componente> -o
```

Consulte `npx shadcn@latest docs <componente>` para exemplos de uso antes de
inventar um padrão novo.

> Este projeto usa Next.js 16, que pode divergir do que você conhece de
> treinamento. Antes de mexer em rotas, cache, data fetching ou config, leia
> `node_modules/next/dist/docs/` (guia oficial versionado com o pacote
> instalado) — ver `AGENTS.md`.

> Este projeto usa **Prisma ORM 7**, que também diverge bastante do que você
> conhece de treinamento (driver adapters obrigatórios, `prisma.config.ts`,
> client gerado em `src/generated/prisma`, sem geração automática de client
> antigo). Antes de editar o schema ou os comandos do Prisma, veja a seção
> "Banco de dados" abaixo e, se precisar de mais detalhes, os skills
> instalados em `.claude/skills/prisma-*` (baixe o `SKILL.md` de
> `github.com/prisma/skills` se a pasta local estiver vazia).

> Este projeto usa **TanStack Table v9**, uma reescrita de API em relação à
> v8 que você provavelmente conhece de treinamento (`useReactTable` →
> `useTable`, features/row-models registrados explicitamente via
> `tableFeatures()`, `ColumnDef<TFeatures, TData, TValue>` com um generic a
> mais). Antes de tocar em `colaboradores/columns.tsx` ou
> `funcionarios-table.tsx`, leia os skills embutidos no pacote —
> `node_modules/@tanstack/table-core/skills/{core,table-features,sorting,
> global-filtering,pagination,migrate-v8-to-v9}/SKILL.md` e
> `node_modules/@tanstack/react-table/skills/{getting-started,
> create-table-hook,migrate-v8-to-v9}/SKILL.md` — em vez de escrever a API v8
> de memória.

```bash
npx prisma generate     # regenera o client em src/generated/prisma (rode após mudar o schema)
npx prisma migrate dev  # cria e aplica uma migration em dev
npx prisma migrate deploy # aplica migrations pendentes (CI/produção, sem shadow db)
npx prisma db seed      # roda prisma/seed.ts
npx prisma studio       # GUI do banco
```

## Estrutura de pastas

```
prisma/
  schema.prisma            # modelagem do banco (ver "Banco de dados")
  seed.ts                  # dados fictícios para desenvolvimento/teste de UI
  migrations/               # histórico de migrations (versionado no git)
prisma.config.ts           # config do CLI do Prisma (schema, migrations, datasource, seed)
src/
  generated/prisma/         # Prisma Client gerado (`npx prisma generate`) — não editar, não commitar
  app/
    layout.tsx              # layout raiz: fontes Geist, <html lang="pt-BR">, TooltipProvider
    page.tsx                # "/" redireciona para /dashboard
    globals.css             # tokens do Design System (cores, radius, fontes)
    (dashboard)/             # route group com o shell autenticado (sidebar + topbar)
      layout.tsx
      dashboard/page.tsx     # visão geral (KPIs + solicitações recentes) — mock-data
      aprovacoes/page.tsx    # fila de aprovação — mock-data
      cargos/                # Cargos e Departamentos — Prisma (CRUD completo)
        page.tsx              # Server Component: busca e agrupa cargos por departamento
        actions.ts             # "use server": createCargo, updateCargo, deleteCargo
        cargo-form-dialog.tsx  # modal de criar/editar (Client Component)
        cargo-card.tsx          # card com dropdown editar/excluir (Client Component)
      beneficios/             # Benefícios — Prisma (CRUD completo)
        page.tsx
        actions.ts
        beneficio-form-dialog.tsx
        beneficio-card.tsx
      colaboradores/          # Colaboradores + Histórico Salarial — Prisma (CRUD completo)
        page.tsx               # Server Component: busca funcionarios+cargo+beneficios+historico
        actions.ts              # "use server": create/update/delete + upsert de benefícios + log de histórico salarial
        types.ts                 # DTOs compartilhados (FuncionarioDTO, CargoOption, BeneficioOption...)
        columns.tsx               # tableFeatures + createColumnHelper + definição das colunas (TanStack v9)
        funcionarios-table.tsx     # useTable + toolbar de busca + paginação + os 3 modais/drawer abaixo
        funcionario-form-dialog.tsx # modal com Tabs: Dados Pessoais / Vínculo Profissional / Benefícios
        funcionario-profile-sheet.tsx # drawer lateral: perfil completo + timeline de histórico salarial
      ferias/                 # Férias e Ausências — Prisma (agendamento + cancelamento)
        page.tsx               # Server Component: busca ferias+funcionario+cargo
        actions.ts              # "use server": createFerias (valida sobreposição), cancelFerias
        types.ts
        agendar-ferias-dialog.tsx # modal: colaborador + datas + dias (auto-calculado)
        ferias-table.tsx           # tabela com FeriasStatusBadge + cancelar
        ferias-timeline.tsx         # calendário/gantt de ausências por departamento (Server Component)
      filtros/                 # Filtros Avançados e Métricas — Prisma (somente leitura)
        page.tsx                # Server Component: métricas agregadas + dataset completo de funcionarios
        types.ts
        filtros-client.tsx        # busca + multiselects + faixa salarial + período de admissão + tabela + CSV
      folha/                   # Folha de Pagamento — Prisma (gerar + editar + marcar pago + processar tudo)
        page.tsx                 # Server Component: lê searchParams (mes/ano), busca folha+itens+benefícios
        actions.ts                # "use server": gerarFolha, editarItemFolha, marcarItemComoPago, processarFolhaCompleta
        types.ts
        folha-periodo-picker.tsx    # <input type="month"> que navega para /folha?mes=&ano=
        gerar-folha-button.tsx       # botão de ação simples (useTransition, sem form)
        editar-item-dialog.tsx        # modal: salarioBruto/descontos/observacao com líquido calculado ao vivo
        folha-table.tsx                 # busca + filtro Pendente/Pago + "Editar"/"Marcar como Pago" + "Processar Folha Completa"
  components/
    ui/                     # componentes shadcn/ui (gerados — editar com cautela)
    layout/                 # sidebar, topbar, user-menu, itens de navegação
    status-badge.tsx        # <StatusBadge status="ativo" /> — badge por status de domínio (mock-data)
    funcionario-status-badge.tsx # <FuncionarioStatusBadge status="ATIVO" /> — idem, para o enum real do Prisma
    ferias-status-badge.tsx # <FeriasStatusBadge status="AGENDADA" /> — idem, para StatusFerias
    folha-status-badge.tsx  # <FolhaStatusBadge status="PAGO" /> e <ItemFolhaStatusBadge status="PAGO" />
    beneficio-badge.tsx     # <BeneficioTipoBadge tipo="SAUDE" /> — ícone + cor por tipo de benefício
    colored-avatar.tsx      # <ColoredAvatar name="..." /> — iniciais com cor determinística por nome
    metric-card.tsx         # <MetricCard label icon colorClassName value /> — KPI colorido (usado em /filtros)
    multi-select-filter.tsx # <MultiSelectFilter label options selected onChange /> — Popover+Command multiseleção
  lib/
    utils.ts                # cn() (clsx + tailwind-merge)
    prisma.ts                # singleton do PrismaClient (com adapter pg) para usar em Server Components/Actions
    format.ts                # currencyFormatter (Intl pt-BR/BRL) e formatCpf — reuse em vez de recriar
    avatar-color.ts           # hash determinístico nome → paleta de cor do ColoredAvatar
    status-labels.ts           # STATUS_FUNCIONARIO_LABEL — reuse em vez de recriar o Record de labels
    ferias-status.ts            # computeFeriasStatus() — status "ao vivo" derivado das datas (ver nota abaixo)
    mock-data.ts             # dados de exemplo do front (independentes do banco — ver nota abaixo)
  types/
    hr.ts                   # tipos de domínio do front (Employee, ApprovalRequest, ...) — só para as páginas mock
```

Novas rotas autenticadas entram dentro de `app/(dashboard)/`, para herdar o
shell (sidebar + topbar) automaticamente. Rotas fora desse grupo (ex.: login)
não devem importar `Sidebar`/`Topbar`.

> `lib/mock-data.ts` e `types/hr.ts` ainda alimentam `dashboard/` e
> `aprovacoes/` — **não** vêm do Prisma. `cargos/`, `beneficios/`,
> `colaboradores/`, `ferias/`, `filtros/` e `folha/` já são 100% Prisma e
> servem de referência do padrão a seguir: ao ligar as demais páginas ao banco de
> verdade, troque o import de `mock-data.ts` por uma query via `lib/prisma.ts`
> num Server Component, e prefira os tipos inferidos do Prisma Client
> (`import type { Funcionario } from "@/generated/prisma/client"`) em vez dos
> tipos manuais de `types/hr.ts`.

## Design System

**Não usar preto/branco/cinza puro como identidade visual.** A paleta vive
inteiramente em `src/app/globals.css` como CSS custom properties, consumidas
via `@theme inline` do Tailwind v4 — não existe `tailwind.config.js`. Para
adicionar uma cor nova ao sistema, declare o token em `:root`/`.dark` e mapeie
em `@theme inline`; não use hexadecimais soltos nos componentes.

### Paleta

| Papel | Token | Uso |
|---|---|---|
| Marca / ação primária | `bg-primary` / `text-primary` | Indigo — botões primários, links ativos, foco |
| Destaque secundário | `bg-accent` / `text-accent-foreground` | Violeta — hover de itens de navegação, ícones de destaque em cards |
| Superfície da página | `bg-background` | Slate 50 (claro) / Slate 950 (escuro) — nunca branco/preto puro |
| Superfície de cartão | `bg-card` | Branco (claro) / Slate 900 (escuro), sempre com `border-border` |
| Texto secundário | `text-muted-foreground` | Slate 500/400 |
| Shell de navegação | `bg-sidebar`, `text-sidebar-foreground`, `bg-sidebar-primary` | Slate escuro com acento Indigo, igual em claro e escuro (rail "enterprise") |

Indigo é sempre a cor de ação (botões primários, links, foco, ring). Violeta é
reservado para destaque/acento secundário — não os alterne livremente ou o
sistema perde consistência.

### Badges de status

Não crie `className` com cores ad-hoc para status. Existem dois componentes,
um para cada modelo de status ainda em uso no projeto (ver nota sobre
mock-data vs. Prisma acima):

`<StatusBadge status="..." />` (`src/components/status-badge.tsx`) — status
em `lowercase`/`snake_case` do front mock (`types/hr.ts`):

| Status | Variante | Cor |
|---|---|---|
| `ativo`, `aprovado` | `success` | Verde |
| `em_ferias` | `warning` | Âmbar |
| `pendente` | `info` | Azul |
| `afastado` | `secondary` | Slate neutro |
| `inativo`, `desligado`, `reprovado` | `destructive` | Vermelho |

`<FuncionarioStatusBadge status="..." />` (`src/components/funcionario-status-badge.tsx`)
— o enum real `StatusFuncionario` do Prisma (`ATIVO`/`FERIAS`/`AFASTADO`/`DESLIGADO`):

| Status | Variante | Cor |
|---|---|---|
| `ATIVO` | `success` | Verde |
| `FERIAS` | `warning` | Âmbar |
| `AFASTADO` | `away` | **Laranja** — distinto do âmbar de férias |
| `DESLIGADO` | `destructive` | Vermelho |

Note que `AFASTADO` usa a variante `away` (token `--away`/`--away-foreground`,
laranja), não `warning` — são estados diferentes e a UI precisa diferenciá-los
visualmente mesmo os dois sendo "tons quentes". Ao introduzir um novo status
de domínio real (Prisma), adicione a entrada no componente correspondente em
vez de usar `<Badge>` direto com cor manual. As variantes `success`/
`warning`/`info`/`away` do `Badge` (`src/components/ui/badge.tsx`) usam os
tokens homônimos definidos em `globals.css` — reutilize-os (ex.: em gráficos,
dots de status) em vez de recriar as cores soltas.

`<FeriasStatusBadge status="..." />` (`src/components/ferias-status-badge.tsx`)
— enum `StatusFerias` do Prisma, reaproveitando as variantes já existentes
(nenhum token novo precisou ser criado):

| Status | Variante | Cor |
|---|---|---|
| `CONCLUIDA` | `success` | Verde |
| `EM_ANDAMENTO` | `info` | Azul |
| `AGENDADA` | `warning` | Âmbar |
| `CANCELADA` | `destructive` | Vermelho |

**Status "ao vivo" vs. status salvo**: o campo `Ferias.status` no banco só é
escrito em dois momentos — `AGENDADA` na criação e `CANCELADA` num
cancelamento explícito. `EM_ANDAMENTO`/`CONCLUIDA` **não** são setados por um
job; eles são derivados na hora da leitura, comparando as datas com "hoje",
por `computeFeriasStatus()` (`src/lib/ferias-status.ts`). Sempre passe o
resultado dessa função para `FeriasStatusBadge`/`ferias-timeline.tsx` — nunca
o `status` cru do banco diretamente na UI, ou o badge ficará
desatualizado (ex.: uma férias `AGENDADA` que já começou continuaria
mostrando "Agendada" para sempre).

`<FolhaStatusBadge status="..." />` e `<ItemFolhaStatusBadge status="..." />`
(`src/components/folha-status-badge.tsx`) — dois enums diferentes do módulo
de Folha de Pagamento, também sem token novo:

| Enum | Status | Variante | Cor |
|---|---|---|---|
| `StatusFolha` (a folha do mês inteira) | `PENDENTE` | `warning` | Âmbar |
| | `PROCESSANDO` | `info` | Azul |
| | `PAGO` | `success` | Verde |
| `StatusItemFolha` (um contracheque) | `PENDENTE` | `warning` | Âmbar |
| | `PAGO` | `success` | Verde |

`StatusFolha` também é derivado, não é livre para setar: só `PENDENTE`
(criação) e o efeito colateral de virar `PAGO`/`PROCESSANDO` acontecem via
`recomputeFolhaStatus()` em `folha/actions.ts`, nunca por uma tela de edição
direta — ver "Folha de Pagamento" abaixo.

### Badges de categoria (tipo de benefício, etc.)

Verde/âmbar/azul (`success`/`warning`/`info`) são reservados a **status de
fluxo** (ativo, pendente, em férias...). Para taxonomias sem workflow — como
`TipoBeneficio` (VR, VT, Saúde, Odonto, Seguro, Previdência, Gympass, Vale
Cultura) — use uma paleta qualitativa própria em vez de reaproveitar essas
três cores. O padrão está em `src/components/beneficio-badge.tsx`
(`TIPO_BENEFICIO_CONFIG`): cada tipo tem um ícone `lucide-react` fixo e uma
cor Tailwind fixa (rose, cyan, orange, sky, violet, red, emerald, fuchsia),
com variante clara/escura (`bg-x-100 text-x-700 dark:bg-x-500/15
dark:text-x-400`). Ao adicionar uma categoria nova nesse estilo, siga o mesmo
formato — não reuse `success`/`warning`/`info` para isso.

### Tipografia, raio e ícones

- Fonte: Geist (sans) / Geist Mono, carregadas via `next/font` em
  `app/layout.tsx`. **Não** referencie `var(--font-geist-sans)` dentro de
  `@theme inline` — Tailwind v4 resolve esse bloco em parse-time e a
  variável só existe em runtime (injetada pelo `next/font` no `<html>`);
  use o stack literal já configurado (`"Geist", "Geist Fallback", ...`).
- Raio padrão: `--radius: 0.625rem` — mantenha os componentes com o mesmo
  raio (`rounded-lg`/`rounded-md` dos tokens), evite valores arbitrários.
- Ícones: `lucide-react`, tamanho `size-4` (dentro de texto) ou `size-5`
  (destaque em card), sem misturar outra biblioteca de ícones.

### Ao construir uma tela nova

1. Prefira os primitivos de `components/ui` (`Card`, `Table`, `Tabs`,
   `Sheet`, `AlertDialog` para ações destrutivas) a `div`/`button` crus.
2. Cards não devem se aninhar dentro de cards. Uma página densa (tabela +
   filtros) usa `Card` como contêiner único por seção.
3. Server Components por padrão; marque `"use client"` só onde há estado ou
   interação (como em `components/layout/sidebar.tsx`, que usa
   `usePathname`).
4. Dados de exemplo ficam em `lib/mock-data.ts` — ao plugar uma API real,
   substitua os imports desse arquivo por data fetching no Server Component
   da página, mantendo os tipos de `types/hr.ts`.

## Formulários, modais e mutações

`cargos/` e `beneficios/` são o modelo a copiar para qualquer novo
cadastro CRUD. O padrão:

- **Página** (`page.tsx`) é um Server Component: busca com `prisma`, converte
  `Decimal` para `number` (`.toNumber()`) e monta um DTO simples antes de
  passar para componentes client — **nunca** passe um objeto Prisma cru
  (com campos `Decimal`) como prop de um Client Component, a serialização
  RSC quebra.
- **Modal de criar/editar** (`*-form-dialog.tsx`, Client Component) é um
  componente único para os dois modos, usando `useActionState` do React com
  a Server Action de `create` ou `update` conforme a prop `mode`. Ele aceita
  `open`/`onOpenChange` **opcionais**: sem eles, o Dialog é não-controlado e
  renderiza seu próprio `DialogTrigger` (botão "Novo X" da página); com eles,
  não renderiza trigger nenhum — quem abre é o card (dropdown "Editar").
- **Card** (`*-card.tsx`, Client Component) tem o `DropdownMenu` de
  ações. "Editar" abre o form dialog controlado; "Excluir" abre um
  `AlertDialog` (nunca `Dialog` puro, para ação destrutiva) que chama a
  Server Action de delete via `useTransition` (não via `<form>`/
  `useActionState`, porque não tem campos — é só um clique).
- **Server Actions** (`actions.ts`, `"use server"`) validam a `FormData` a
  mão (sem lib de validação ainda — se o schema crescer, considere
  `zod`), devolvem `{ success: boolean; message: string }` e chamam
  `revalidatePath(...)` após mutar. `delete*` trata erros de FK do Postgres
  (`Prisma.PrismaClientKnownRequestError` com `code === "P2003"`) com uma
  mensagem amigável em vez de deixar o erro genérico subir.

**`colaboradores/actions.ts`** é o caso mais rico e vale ler antes de copiar o
padrão para outro cadastro com relações: `createFuncionario`/`updateFuncionario`
rodam dentro de `prisma.$transaction(async (tx) => ...)` porque cada operação
mexe em três tabelas — `Funcionario`, `FuncionarioBeneficio` (sincronizada via
`deleteMany` dos que saíram + `upsert` por `funcionarioId_beneficioId` dos que
ficaram/entraram) e `HistoricoSalario`. O histórico salarial **não é editável
diretamente**: um registro "Contratação" é criado automaticamente ao cadastrar
alguém, e um novo registro só é criado quando `salarioAtual` muda numa edição
— nesse caso o formulário exige um "motivo" (`motivoAlteracaoSalarial`) antes
de deixar salvar. Não crie uma tela solta de CRUD para `HistoricoSalario`; ele
é sempre derivado de uma mudança de salário de um `Funcionario`.

**`ferias/actions.ts`**: `createFerias` impõe a regra de negócio "sem
sobreposição" consultando o próprio banco antes de inserir — busca por uma
`Ferias` do mesmo `funcionarioId`, com `status != CANCELADA`, cujo intervalo
cruze com o novo (`dataInicio <= novaDataFim AND dataFim >= novaDataInicio`).
Períodos cancelados **não** contam como conflito, então cancelar libera a
data para reagendamento. Não implemente essa checagem no client (o formulário
não sabe o histórico completo do colaborador) — é sempre uma validação de
servidor, como qualquer regra de negócio que dependa do estado atual do
banco. `cancelFerias` só troca o `status` para `CANCELADA`; não há exclusão
física de período de férias.

### Tabelas de dados (TanStack Table v9)

`colaboradores/columns.tsx` + `funcionarios-table.tsx` são a referência para
qualquer tabela nova com busca/ordenação/paginação. Resumo do padrão:

- `columns.tsx` declara `tableFeatures({...})` (registrando só o que é usado:
  `columnFilteringFeature` + `globalFilteringFeature` + `filteredRowModel`
  para a busca, `rowSortingFeature` + `sortedRowModel` para ordenação,
  `rowPaginationFeature` + `paginatedRowModel` para paginação) e exporta esse
  objeto junto com `createColumnHelper<typeof features, TData>()` — as
  colunas usam `helper.accessor(...)`/`helper.display(...)`, nunca um array
  de `ColumnDef` escrito à mão.
- O componente da tabela chama `useTable({ features, columns, data, state,
  onSortingChange, onGlobalFilterChange, globalFilterFn: "includesString" })`
  — não `useReactTable`, e sem passar `getCoreRowModel`/`getSortedRowModel`
  como opções (isso é v8).
- `columns` vem de `useMemo` com deps estáveis (os `setState` de
  view/edit/delete não mudam de referência) — recriar o array de colunas a
  cada render invalida os modelos internos da tabela.
- Renderização usa `<table.FlexRender header={header} />` e
  `<table.FlexRender cell={cell} />` (não o `flexRender()` standalone da v8,
  embora ele ainda funcione) e `row.getAllCells()`.
- Não existe mais um wrapper genérico `<DataTable columns={...} data={...}
  />` reutilizável entre entidades neste projeto — a v9 tipa `ColumnDef` por
  `TFeatures` (um terceiro generic), então um componente genérico exigiria
  propagar esse generic também. Com uma única tabela no app, construir a
  tabela diretamente em `funcionarios-table.tsx` (via `useTable`) é mais
  simples que lutar contra os generics; se um segundo módulo com tabela
  aparecer, aí sim considere `createTableHook` (skill
  `@tanstack/react-table#create-table-hook`) para uma fábrica compartilhada.

### Toasts (sonner)

`<Toaster />` está montado em `app/layout.tsx`. Chame `toast.success(...)`,
`toast.warning(...)`, `toast.error(...)` ou `toast.info(...)` (import de
`"sonner"`) direto nos componentes client após uma Server Action retornar —
ver o `useEffect` que observa `state` em qualquer `*-form-dialog.tsx`. As
cores por tipo são customizadas em `src/components/ui/sonner.tsx`
(`toastOptions.classNames`) para usar os mesmos tokens `--success`/
`--warning`/`--destructive`/`--info` dos badges, em vez do `richColors`
padrão do sonner. Não chame `toast(...)` genérico para resultado de
sucesso/erro — use sempre a variante certa.

### Pegadinhas reais deste stack (já resolvidas, não repita)

1. **`asChild` não existe aqui.** Os componentes `ui/*` deste projeto usam
   `@base-ui/react` (não Radix), cujo equivalente a `asChild` é a prop
   `render`: `<DialogTrigger render={<Button>...</Button>} />` em vez de
   `<DialogTrigger asChild><Button>...</Button></DialogTrigger>`. Mesma
   troca vale para `DropdownMenuTrigger`, `AlertDialogCancel` etc.
2. **Nunca importe um *valor* de `@/generated/prisma/client` num arquivo
   `"use client"`.** Esse módulo carrega o runtime inteiro do Prisma
   (`@prisma/client/runtime/client`, `node:process`, `node:path`...) e
   quebra o build do Turbopack no bundle do browser ("does not support
   external modules (request: node:module)"). Para um enum como
   `TipoBeneficio` num Client Component, importe de
   `@/generated/prisma/enums` (sem dependências) em vez de `.../client`.
   `import type { ... } from ".../client"` é seguro (é apagado no build);
   o problema é só import de **valor**. Server Actions e Server Components
   (arquivos sem `"use client"`) podem importar de `.../client` normalmente.
3. **`Tabs` do base-ui desmonta painéis inativos por padrão
   (`keepMounted` é `false`).** Num formulário de várias abas dentro de um
   único `<form>` (ex.: `funcionario-form-dialog.tsx`), isso tira os campos
   das abas não-visitadas do `FormData` no submit. Toda `TabsContent` de um
   form multi-aba precisa de `keepMounted` explícito.
4. **Não use `useEffect` só para sincronizar/resetar estado local a partir
   de uma prop** (ex.: repopular os campos do formulário quando o registro
   sendo editado muda) — o `eslint-plugin-react-hooks` bloqueia isso
   (`react-hooks/set-state-in-effect`) porque causa re-renders em cascata.
   O padrão usado aqui (`funcionario-form-dialog.tsx`): separe os campos que
   têm estado local em um componente filho e dê a ele `key={registro?.id ??
   "novo"}` — trocar a `key` remonta o componente e os `useState` já nascem
   com o valor certo, sem efeito nenhum. O componente pai (dono do
   `Dialog`/`open`) não remonta, então a animação de abrir/fechar continua
   normal. Quando não há um "registro" que muda (ex.: um modal de criação
   simples, como `agendar-ferias-dialog.tsx`) e o estado local só precisa
   zerar quando o modal reabre, nem isso é necessário: o `Dialog` do base-ui
   **desmonta o `DialogContent` inteiro ao fechar** (não existe prop
   `keepMounted` nele, ao contrário do `Tabs`), então basta manter o
   `useState` num componente renderizado dentro do `DialogContent` — ele
   nasce zerado sozinho a cada abertura, sem efeito nenhum.
5. **`toast.success(...); setOpen(false)` dentro do `useEffect` que observa
   o `state` do `useActionState` é o padrão certo** (é reagir ao resultado
   de um sistema externo — a Server Action — não espelhar uma prop), mas o
   `react-hooks/set-state-in-effect` às vezes sinaliza mesmo assim quando o
   `setOpen` usado é literalmente o setter cru de um `useState` local (o
   lint não consegue provar que é seguro). Nos `*-form-dialog.tsx` de
   `cargos/`/`beneficios/`/`colaboradores/` isso não aparece porque `setOpen`
   passa por um indireto (`isControlled ? onOpenChangeProp! :
   setInternalOpen`); em `ferias/agendar-ferias-dialog.tsx`, que não tem essa
   indireção, o erro aparece e foi resolvido com um
   `// eslint-disable-next-line react-hooks/set-state-in-effect` pontual,
   comentando o motivo. Não desabilite a regra a esmo — só nesse caso
   específico (fechar o modal em resposta a um resultado de servidor), e só
   depois de confirmar que não é o antipadrão do item 4.
6. **`PageProps<'/rota'>` só existe depois que o Next gera os tipos da
   rota.** Ao criar uma página nova (ex.: `app/(dashboard)/folha/page.tsx`)
   e tipar com `PageProps<"/folha">`, o `tsc` isolado (fora do `next dev`)
   pode acusar `Type '"/folha"' does not satisfy the constraint 'AppRoutes'`
   porque `.next/types/routes.d.ts` ainda não conhece a rota nova. Rode
   `npx next typegen` (ou `next dev`/`next build`, que fazem o mesmo) depois
   de criar/renomear uma rota e antes de rodar `tsc --noEmit` isolado.
7. **`revalidatePath()` sozinho não repinta uma tela já aberta quando a
   Server Action é chamada fora de um `<form action={...}>`.** Um `<form
   action={formAction}>` (o padrão dos `*-form-dialog.tsx` deste projeto)
   ganha refresh automático do router depois que a action resolve. Já uma
   chamada imperativa — `startTransition(async () => { await minhaAction(id)
   })`, usada em botões simples tipo "Marcar como Pago", "Cancelar",
   "Excluir" — só invalida o cache do **servidor**; o Router Cache do
   **client** continua com o payload antigo até algo mandar descartá-lo. O
   sintoma é exatamente "o toast de sucesso aparece mas a tela não muda".
   Corrigido chamando `router.refresh()` (de `next/navigation`) logo depois
   do `toast.success(...)`, dentro do mesmo callback da transição — aplicado
   em todo botão que chama uma Server Action via `startTransition` fora de um
   `<form>`: `folha/folha-table.tsx` (marcar como pago, processar folha
   completa), `folha/gerar-folha-button.tsx`, `folha/editar-item-dialog.tsx`,
   `cargos/cargo-card.tsx`, `beneficios/beneficio-card.tsx`,
   `colaboradores/funcionarios-table.tsx` e `ferias/ferias-table.tsx`
   (excluir/cancelar). **Ao criar um novo botão de ação imperativa (fora de
   `<form>`), sempre chame `router.refresh()` no callback de sucesso** — não
   é automático como em formulários com `useActionState`.

## Filtros e métricas (`/filtros`)

Página somente leitura, pensada para RH consultar o quadro todo. Dois
conceitos que não devem se misturar:

- **Métricas do topo** (`MetricCard`s em `page.tsx`) são agregados do banco
  inteiro — `prisma.funcionario.count()`, `.aggregate({_sum})`, contagem
  distinta de `Ferias` cruzando o mês atual, soma de `FuncionarioBeneficio`
  (com fallback `valorCustomizado ?? beneficio.valorPadrao`, calculado em JS
  porque essa coalescência não dá pra expressar num `aggregate` do Prisma).
  Elas **não** reagem aos filtros da tabela — são sempre a fotografia da
  empresa inteira. "Folha Salarial" e "Custo de Benefícios" excluem
  colaboradores `DESLIGADO`; "Total de Colaboradores" conta todo mundo.
- **A tabela filtrada** (`filtros-client.tsx`) é outra coisa: o `page.tsx`
  busca o dataset completo de funcionários uma única vez e manda pro client;
  busca por nome/CPF, os três `MultiSelectFilter` (departamento/cargo/status),
  faixa salarial e período de admissão são só `useMemo` sobre esse array já
  carregado — sem round-trip ao servidor a cada filtro. Isso é aceitável no
  tamanho de dataset de um boilerplate (dezenas/centenas de linhas); se o
  quadro de colaboradores crescer muito, mova o filtro para query params +
  Prisma `where` no Server Component em vez de filtrar tudo no client.

`MultiSelectFilter` (`src/components/multi-select-filter.tsx`) é
`Popover` + `Command` (`cmdk`) + o ícone de check já embutido no
`CommandItem` do shadcn (ativado via `data-checked={selecionado}`, não
precisa desenhar checkbox à mão) — reuse esse componente para qualquer outro
filtro de múltipla escolha, em vez de montar um de novo.

**Exportar CSV** é só client-side: monta a string CSV a partir das linhas já
filtradas em memória, cria um `Blob` com BOM UTF-8 (`"﻿" + csv`, para
acentos abrirem certo no Excel) e dispara o download via um `<a download>`
temporário — sem rota de API. Ver `exportarCsv()` em `filtros-client.tsx`.

## Folha de Pagamento (`/folha`)

Uma `FolhaPagamento` é única por `(mes, ano)` (`@@unique([mes, ano])`) e tem
vários `ItemFolha` (um por colaborador, também único por `(folhaId,
funcionarioId)`). O período exibido vem da URL — `/folha?mes=8&ano=2026`,
lido em `page.tsx` via `searchParams` (por isso essa rota é a única
`ƒ dynamic` do app no `next build`, as demais são `○ static`) — e trocado
pelo `<input type="month">` de `folha-periodo-picker.tsx`, que só faz
`router.push` para uma nova URL; não existe estado de período fora da URL.

**Fluxo de status é derivado, não editável direto** (mesmo espírito do
`computeFeriasStatus`, mas aqui é persistido em vez de calculado na leitura,
porque cada mudança já passa por uma Server Action):

1. "Gerar Folha do Período" (`gerarFolha`, sem colaborador nenhum pago ainda)
   cria a `FolhaPagamento` com `status: PENDENTE` e um `ItemFolha` por
   colaborador **não `DESLIGADO`**, com `salarioBruto` = `Funcionario.salarioAtual`
   no momento da geração (não é um link ao vivo — se o salário mudar depois,
   a folha já gerada não muda) e `descontos` calculados por
   `TAXA_DESCONTO_ILUSTRATIVA = 0.11` — **isso é ilustrativo, não é cálculo
   real de INSS/IRRF**; existe só para a métrica "Total de Descontos" não
   ficar zerada na demo. Não trate como referência de payroll de verdade.
2. **"Editar" (`editarItemFolha`)** — só aparece no menu de ações de um item
   `PENDENTE` (a Server Action também recusa, mesmo que a UI tentasse: `if
   (itemAtual.status === StatusItemFolha.PAGO) return { success: false, ... }`).
   Recebe `salarioBruto`/`descontos`/`observacao` livres, recalcula
   `valorLiquido = salarioBruto - descontos` no servidor (nunca confie no
   líquido calculado no client, ele é só preview) e, dentro da mesma
   transação, chama `recomputeFolhaValorTotal()` pra ressomar
   `FolhaPagamento.valorTotal` a partir de **todos** os itens — sem isso o
   card "Total Líquido" ficaria desatualizado depois de uma edição.
3. "Marcar como Pago" (`marcarItemComoPago`) muda **um** `ItemFolha` para
   `PAGO` (gravando `ItemFolha.dataPagamento`) e chama
   `recomputeFolhaStatus()`, que decide o status da `FolhaPagamento` a
   partir da contagem de itens pagos: nenhum → `PENDENTE`, alguns →
   `PROCESSANDO`, todos → `PAGO` (e só aí grava `FolhaPagamento.dataPagamento`).
4. "Processar Folha Completa" (`processarFolhaCompleta`) faz o mesmo em lote
   (`updateMany` dos `PENDENTE` → `PAGO`, gravando `dataPagamento` em cada
   item) e chama o mesmo `recomputeFolhaStatus()` — **é literalmente clicar
   "Marcar como Pago" em todo mundo de uma vez**, não um código separado.

Não existe "desfazer" um pagamento nem editar um item já `PAGO` — isso é
proposital (um contracheque pago é um registro histórico). Se precisar
corrigir algo depois de pago, o caminho seria um fluxo de estorno explícito,
não reabrir a edição do item existente. O card **"% Paga no Mês"**
(`page.tsx`) é `valorLíquido dos itens PAGO / valorLíquido total da folha` —
proporção **em valor**, não em quantidade de colaboradores.

## Banco de dados (Prisma + PostgreSQL)

### Por que o schema Postgres é `rh`, e não `public`

O banco Neon configurado em `DATABASE_URL` é **compartilhado com outro
projeto** que já ocupa o schema `public` (tabelas `Customer`, `Order`,
`OrderItem`, `Product`, `FinancialTransaction`) e há também um schema
`neon_auth`, gerenciado pela própria Neon — nenhum dos dois pertence a este
projeto. Por isso `datasource.schemas` em `prisma/schema.prisma` está
restrito a `["rh"]` e todo model tem `@@schema("rh")`: as tabelas do RH
Enterprise vivem isoladas em `rh.*` e a migration inicial só faz `CREATE
SCHEMA IF NOT EXISTS "rh"` + objetos dentro dela.

**Nunca** rode `prisma migrate reset`, `prisma db push --force-reset` ou
`--accept-data-loss` sem confirmar explicitamente com quem estiver pedindo —
essas operações podem afetar (ou, dependendo da configuração, apagar) dados
fora do schema `rh`. O Prisma 7 já bloqueia esses comandos por padrão para
agentes de IA até haver consentimento explícito do usuário na conversa (não
infira consentimento de mensagens antigas ou não relacionadas).

Detalhe de infraestrutura: como `public` não está listado em
`datasource.schemas`, a tabela de bookkeeping `_prisma_migrations` do Prisma
continua sendo criada em `public` (comportamento padrão do schema engine) e
fica compartilhada com o outro projeto — ela só guarda nome/data de cada
migration aplicada, não interfere nos dados de nenhum dos dois lados.

### Modelagem (`prisma/schema.prisma`)

- `Cargo` — cargo/posição (nome, departamento, salário-base) — 1:N com `Funcionario`
- `Beneficio` — catálogo de benefícios, com `tipo` (`TipoBeneficio`: SAUDE,
  ODONTOLOGICO, VALE_REFEICAO, VALE_TRANSPORTE, PREVIDENCIA_PRIVADA,
  SEGURO_DE_VIDA, GYMPASS, VALE_CULTURA) e valor padrão
- `Funcionario` — colaborador; `status` (`StatusFuncionario`: ATIVO, FERIAS,
  AFASTADO, DESLIGADO), vinculado a um `Cargo`
- `FuncionarioBeneficio` — tabela de junção N:N entre `Funcionario` e
  `Beneficio`, chave primária composta (`funcionarioId`, `beneficioId`), com
  `valorCustomizado` opcional (sobrescreve o valor padrão do benefício)
- `HistoricoSalario` — trilha de alterações salariais de um `Funcionario`
  (valor, motivo, data); populada pela aplicação (não editável direto — ver
  "Formulários, modais e mutações")
- `Ferias` — períodos de férias de um `Funcionario`, com `status`
  (`StatusFerias`: AGENDADA, EM_ANDAMENTO, CONCLUIDA, CANCELADA)
- `FolhaPagamento` — uma folha por `(mes, ano)` (`@@unique`), com `status`
  (`StatusFolha`: PENDENTE, PROCESSANDO, PAGO) e `valorTotal` (snapshot do
  líquido somado na geração); `itens: ItemFolha[]`
- `ItemFolha` — um contracheque por `(folhaId, funcionarioId)` (`@@unique`),
  com `salarioBruto`/`descontos`/`valorLiquido`, `status`
  (`StatusItemFolha`: PENDENTE, PAGO), `dataPagamento` (opcional, gravada só
  ao marcar como pago) e `observacao` (texto livre opcional, ex.: "bônus de
  performance") — editável enquanto `PENDENTE`, ver "Folha de Pagamento" acima

Campos são `camelCase` no client do Prisma (ex.: `cargoId`, `salarioAtual`,
`dataAdmissao`), mapeados via `@map`/`@@map` para colunas/tabelas
`snake_case` no Postgres. Ao adicionar um campo ou model, siga esse padrão em
vez de deixar o nome do client igual ao da coluna.

### Prisma 7: pontos que fogem do Prisma "clássico"

- **Client gerado em `src/generated/prisma`** (não em `node_modules/@prisma/client`).
  Importe de `@/generated/prisma/client`, nunca de `@prisma/client` direto.
- **Driver adapter obrigatório**: não existe mais engine binário embutido
  para SQL. O client sempre recebe um `adapter` (`@prisma/adapter-pg` +
  `pg`, configurado em `src/lib/prisma.ts`).
- **`moduleFormat = "cjs"`** no generator (`schema.prisma`) — o projeto não
  usa `"type": "module"` no `package.json`, então o client gerado fica em
  CommonJS para casar com o resto do projeto Next.js.
- **Configuração via `prisma.config.ts`**, não mais só `.env` + schema. A URL
  do banco e o comando de seed (`tsx prisma/seed.ts`) estão declarados lá.
- **Seed não roda mais automaticamente** após `migrate dev`/`migrate reset` —
  execute `npx prisma db seed` explicitamente.
- **Migrations aplicadas via `migrate deploy`, não `migrate dev`**: como o
  banco é compartilhado com outro projeto/schema, o `migrate dev` tenta
  comparar o estado inteiro do banco (drift detection) — e a tabela de
  bookkeeping `_prisma_migrations` não tem coluna de schema, então ele
  enxerga a migration do app alheio (em `public`) mesmo com
  `datasource.schemas = ["rh"]`, e trava pedindo pra resetar `rh`. **Nunca
  rode `migrate dev` neste projeto** — gere o SQL offline e aplique com
  `migrate deploy`, que só executa por nome de arquivo, sem inspecionar o
  resto do banco:
  - **Primeira migration** (schema `rh` ainda não existe): `prisma migrate
    diff --from-empty --to-schema=prisma/schema.prisma --script`.
  - **Migrations seguintes** (schema `rh` já tem tabelas): `--from-empty`
    geraria `CREATE TABLE` para tudo de novo. Use `--from-config-datasource`
    em vez disso — ele introspecciona o banco **de verdade** (via a
    `DATABASE_URL` do `prisma.config.ts`) como estado de partida, então o
    diff sai só com o que mudou. (`--from-migrations`, que usa a pasta
    `prisma/migrations/` como estado de partida em vez do banco ao vivo,
    também resolveria isso em teoria, mas exige `shadowDatabaseUrl`
    configurado — que este projeto não tem — então dá erro; fique com
    `--from-config-datasource`.) Exemplo usado para adicionar
    `FolhaPagamento`/`ItemFolha`:
    ```bash
    npx prisma migrate diff --from-config-datasource --to-schema=prisma/schema.prisma --script > prisma/migrations/<timestamp>_nome/migration.sql
    npx prisma migrate deploy
    ```
  - Depois de qualquer uma das duas, rode `npx prisma generate` para
    atualizar o client em `src/generated/prisma`.

### Seed (`prisma/seed.ts`)

`npx prisma db seed` limpa as tabelas de `rh.*` (respeitando FKs — `itemFolha`
e `folhaPagamento` são apagadas primeiro, explicitamente, já que
`ItemFolha` só cascateia a partir de `Funcionario`/`FolhaPagamento`, não o
inverso) e recria um conjunto fictício: 10 cargos em 6 departamentos, os 8
tipos de benefício, 14 funcionários cobrindo os 4 valores de
`StatusFuncionario`, histórico salarial para vários deles, períodos de férias
cobrindo os 4 valores de `StatusFerias`, e uma `FolhaPagamento` de 07/2026 já
totalmente `PAGO` (12 itens, dois deles com `observacao` e valores ajustados
manualmente, simulando uma edição feita pelo RH) — dados pensados para
exercitar todo badge de status da UI de uma vez, incluindo o fluxo de edição
da folha. É destrutivo apenas dentro de `rh.*`; rode de novo sempre que
precisar resetar os dados de teste (isso também apaga qualquer folha que
você tenha gerado manualmente pela UI, como a do mês corrente).
