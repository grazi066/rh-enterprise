"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, Pencil, Trash2, Users } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { currencyFormatter } from "@/lib/format"
import { deleteCargo } from "./actions"
import { CargoFormDialog, type CargoDTO } from "./cargo-form-dialog"
import { ColaboradoresSheet, type ColaboradorListItem } from "./colaboradores-sheet"

interface CargoCardProps {
  cargo: CargoDTO
  departamentosExistentes: string[]
  colaboradores: ColaboradorListItem[]
}

export function CargoCard({ cargo, departamentosExistentes, colaboradores }: CargoCardProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCargo(cargo.id)
      if (result.success) {
        toast.success(result.message)
        setDeleteOpen(false)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div className="min-w-0">
            <p className="truncate font-medium leading-tight">{cargo.nome}</p>
            <p className="text-xs text-muted-foreground">
              {currencyFormatter.format(cargo.salarioBase)}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mt-1 -mr-1 size-7 shrink-0"
                  aria-label="Mais ações"
                >
                  <MoreVertical className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <ColaboradoresSheet
            title={`${cargo.nome} · ${cargo.departamento}`}
            emptyMessage="Nenhum colaborador vinculado a este cargo."
            colaboradores={colaboradores}
            trigger={
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                <Users className="size-3.5" />
                {colaboradores.length}{" "}
                {colaboradores.length === 1 ? "colaborador" : "colaboradores"}
              </button>
            }
          />
        </CardContent>
      </Card>

      <CargoFormDialog
        mode="edit"
        cargo={cargo}
        departamentosExistentes={departamentosExistentes}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cargo?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso remove permanentemente o cargo &ldquo;{cargo.nome}&rdquo;.
              Cargos com colaboradores vinculados não podem ser excluídos.
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
    </>
  )
}
