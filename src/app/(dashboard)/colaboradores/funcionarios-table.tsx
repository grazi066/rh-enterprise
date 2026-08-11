"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTable, type SortingState } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { funcionarioTableFeatures, getFuncionarioColumns } from "./columns"
import { deleteFuncionario } from "./actions"
import { FuncionarioFormDialog } from "./funcionario-form-dialog"
import { FuncionarioProfileSheet } from "./funcionario-profile-sheet"
import type { BeneficioOption, CargoOption, FuncionarioDTO } from "./types"

interface FuncionariosTableProps {
  funcionarios: FuncionarioDTO[]
  cargos: CargoOption[]
  beneficios: BeneficioOption[]
}

export function FuncionariosTable({
  funcionarios,
  cargos,
  beneficios,
}: FuncionariosTableProps) {
  const router = useRouter()
  const [viewing, setViewing] = useState<FuncionarioDTO | null>(null)
  const [editing, setEditing] = useState<FuncionarioDTO | null>(null)
  const [deleting, setDeleting] = useState<FuncionarioDTO | null>(null)
  const [isPending, startTransition] = useTransition()

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  // Referência estável: recriar as colunas a cada render invalidaria os
  // modelos memoizados do TanStack Table (ver skill "core" da lib).
  const columns = useMemo(
    () =>
      getFuncionarioColumns({
        onView: setViewing,
        onEdit: setEditing,
        onDelete: setDeleting,
      }),
    []
  )

  const table = useTable({
    features: funcionarioTableFeatures,
    columns,
    data: funcionarios,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
  })

  function handleDelete() {
    if (!deleting) return
    const funcionario = deleting
    startTransition(async () => {
      const result = await deleteFuncionario(funcionario.id)
      if (result.success) {
        toast.success(result.message)
        setDeleting(null)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="Buscar por nome, CPF, cargo, departamento..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-xs"
        />
        <FuncionarioFormDialog
          mode="create"
          cargos={cargos}
          beneficios={beneficios}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()

                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-1.5 select-none hover:text-foreground"
                        >
                          <table.FlexRender header={header} />
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => setViewing(row.original)}
                  className="cursor-pointer"
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Nenhum colaborador cadastrado ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} de {funcionarios.length}{" "}
          colaboradores
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próxima
          </Button>
        </div>
      </div>

      <FuncionarioFormDialog
        mode="edit"
        funcionario={editing ?? undefined}
        cargos={cargos}
        beneficios={beneficios}
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      />

      <FuncionarioProfileSheet
        funcionario={viewing}
        open={!!viewing}
        onOpenChange={(open) => !open && setViewing(null)}
        onEdit={() => {
          if (viewing) setEditing(viewing)
          setViewing(null)
        }}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir colaborador?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso remove permanentemente &ldquo;{deleting?.nome}&rdquo;, seus
              benefícios vinculados, histórico salarial e períodos de férias.
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
