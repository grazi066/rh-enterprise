"use client"

import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
} from "@tanstack/react-table"
import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ColoredAvatar } from "@/components/colored-avatar"
import { FuncionarioStatusBadge } from "@/components/funcionario-status-badge"
import { currencyFormatter, formatCpf } from "@/lib/format"
import type { FuncionarioDTO } from "./types"

// TanStack Table v9: features are registered explicitly (no more implicit
// "everything bundled" like v8's useReactTable) — see CLAUDE.md.
export const funcionarioTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric },
})

const columnHelper = createColumnHelper<
  typeof funcionarioTableFeatures,
  FuncionarioDTO
>()

interface ColumnHandlers {
  onView: (funcionario: FuncionarioDTO) => void
  onEdit: (funcionario: FuncionarioDTO) => void
  onDelete: (funcionario: FuncionarioDTO) => void
}

export function getFuncionarioColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnHandlers) {
  return columnHelper.columns([
    columnHelper.accessor(
      (row) => `${row.nome} ${row.cpf} ${row.email}`,
      {
        id: "colaborador",
        header: "Nome / CPF",
        cell: ({ row }) => {
          const funcionario = row.original
          return (
            <div className="flex items-center gap-3">
              <ColoredAvatar name={funcionario.nome} />
              <div className="min-w-0">
                <p className="truncate font-medium leading-tight">
                  {funcionario.nome}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCpf(funcionario.cpf)}
                </p>
              </div>
            </div>
          )
        },
      }
    ),
    columnHelper.accessor(
      (row) => `${row.cargo.nome} ${row.cargo.departamento}`,
      {
        id: "cargo",
        header: "Cargo / Departamento",
        cell: ({ row }) => (
          <div>
            <p className="leading-tight">{row.original.cargo.nome}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.cargo.departamento}
            </p>
          </div>
        ),
      }
    ),
    columnHelper.accessor("dataAdmissao", {
      header: "Admissão",
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString("pt-BR"),
    }),
    columnHelper.accessor("salarioAtual", {
      header: "Salário Atual",
      cell: ({ getValue }) => currencyFormatter.format(getValue()),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => <FuncionarioStatusBadge status={getValue()} />,
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div
          className="flex justify-end"
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label="Mais ações"
                >
                  <MoreVertical className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(row.original)}>
                <Eye />
                Ver perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Pencil />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(row.original)}
              >
                <Trash2 />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ])
}
