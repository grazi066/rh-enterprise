"use client"

import { cloneElement, useState, type ReactElement } from "react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ColoredAvatar } from "@/components/colored-avatar"
import { FuncionarioStatusBadge } from "@/components/funcionario-status-badge"
import { currencyFormatter } from "@/lib/format"
import type { StatusFuncionario } from "@/generated/prisma/enums"

export interface ColaboradorListItem {
  id: string
  nome: string
  cargoNome: string
  status: StatusFuncionario
  salarioAtual: number
}

interface ColaboradoresSheetProps {
  title: string
  emptyMessage: string
  colaboradores: ColaboradorListItem[]
  trigger: ReactElement<{ onClick?: () => void }>
}

// Sheet genérico reutilizado tanto na expansão por departamento quanto por
// cargo — o trigger é controlado externamente (clonado com onClick) em vez
// de usar SheetTrigger, seguindo o mesmo padrão de abertura manual do
// MobileSidebar.
export function ColaboradoresSheet({
  title,
  emptyMessage,
  colaboradores,
  trigger,
}: ColaboradoresSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {cloneElement(trigger, { onClick: () => setOpen(true) })}
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {colaboradores.length}{" "}
            {colaboradores.length === 1 ? "colaborador" : "colaboradores"}.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {colaboradores.length === 0 ? (
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Salário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colaboradores.map((colaborador) => (
                  <TableRow key={colaborador.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ColoredAvatar name={colaborador.nome} />
                        <div className="min-w-0">
                          <p className="truncate font-medium leading-tight">
                            {colaborador.nome}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {colaborador.cargoNome}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <FuncionarioStatusBadge status={colaborador.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {currencyFormatter.format(colaborador.salarioAtual)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
