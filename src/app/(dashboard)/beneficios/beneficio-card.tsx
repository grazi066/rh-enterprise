"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
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
import { BeneficioTipoBadge, TIPO_BENEFICIO_CONFIG } from "@/components/beneficio-badge"
import { currencyFormatter } from "@/lib/format"
import { deleteBeneficio } from "./actions"
import { BeneficioFormDialog, type BeneficioDTO } from "./beneficio-form-dialog"

export function BeneficioCard({ beneficio }: { beneficio: BeneficioDTO }) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const config = TIPO_BENEFICIO_CONFIG[beneficio.tipo]
  const Icon = config.icon

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteBeneficio(beneficio.id)
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
          <div className="flex items-start gap-3">
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${config.className}`}
            >
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium leading-tight">
                {beneficio.nome}
              </p>
              <BeneficioTipoBadge tipo={beneficio.tipo} className="mt-1.5" />
            </div>
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
        <CardContent className="text-sm text-muted-foreground">
          Valor padrão:{" "}
          <span className="font-medium text-foreground">
            {currencyFormatter.format(beneficio.valorPadrao)}
          </span>
        </CardContent>
      </Card>

      <BeneficioFormDialog
        mode="edit"
        beneficio={beneficio}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir benefício?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso remove permanentemente &ldquo;{beneficio.nome}&rdquo; e
              também as adesões de colaboradores a ele.
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
