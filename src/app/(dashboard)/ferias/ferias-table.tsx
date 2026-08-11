"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, XCircle } from "lucide-react"
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
import { FeriasStatusBadge } from "@/components/ferias-status-badge"
import { computeFeriasStatus } from "@/lib/ferias-status"
import { StatusFerias } from "@/generated/prisma/enums"
import { cancelFerias } from "./actions"
import type { FeriasDTO } from "./types"

const dateFormatter = new Intl.DateTimeFormat("pt-BR")

export function FeriasTable({ ferias }: { ferias: FeriasDTO[] }) {
  const router = useRouter()
  const [cancelando, setCancelando] = useState<FeriasDTO | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    if (!cancelando) return
    const alvo = cancelando
    startTransition(async () => {
      const result = await cancelFerias(alvo.id)
      if (result.success) {
        toast.success(result.message)
        setCancelando(null)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colaborador</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Dias</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ferias.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Nenhum período de férias registrado ainda.
                </TableCell>
              </TableRow>
            ) : (
              ferias.map((item) => {
                const statusAoVivo = computeFeriasStatus(item)
                const podeCancelar = statusAoVivo !== StatusFerias.CANCELADA

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.funcionario.nome}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.funcionario.departamento}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dateFormatter.format(new Date(item.dataInicio))} –{" "}
                      {dateFormatter.format(new Date(item.dataFim))}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.dias}
                    </TableCell>
                    <TableCell>
                      <FeriasStatusBadge status={statusAoVivo} />
                    </TableCell>
                    <TableCell className="text-right">
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
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={!podeCancelar}
                            onClick={() => setCancelando(item)}
                          >
                            <XCircle />
                            Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!cancelando}
        onOpenChange={(open) => !open && setCancelando(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar férias?</AlertDialogTitle>
            <AlertDialogDescription>
              As férias de &ldquo;{cancelando?.funcionario.nome}&rdquo; entre{" "}
              {cancelando &&
                `${dateFormatter.format(new Date(cancelando.dataInicio))} e ${dateFormatter.format(new Date(cancelando.dataFim))}`}{" "}
              serão marcadas como canceladas. Isso não pode ser desfeito.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleCancel}
              disabled={isPending}
            >
              {isPending ? "Cancelando..." : "Cancelar férias"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
