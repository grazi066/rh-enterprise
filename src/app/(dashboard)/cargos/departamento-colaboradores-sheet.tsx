"use client"

import { useState } from "react"
import { Users } from "lucide-react"

import { Button } from "@/components/ui/button"
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

export interface DepartamentoColaboradorDTO {
  id: string
  nome: string
  cargoNome: string
  status: StatusFuncionario
  salarioAtual: number
}

interface DepartamentoColaboradoresSheetProps {
  departamento: string
  colaboradores: DepartamentoColaboradorDTO[]
}

export function DepartamentoColaboradoresSheet({
  departamento,
  colaboradores,
}: DepartamentoColaboradoresSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Users className="size-3.5" />
        Ver colaboradores
      </Button>
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>{departamento}</SheetTitle>
          <SheetDescription>
            {colaboradores.length}{" "}
            {colaboradores.length === 1 ? "colaborador" : "colaboradores"}{" "}
            neste departamento.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {colaboradores.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum colaborador vinculado a este departamento.
            </p>
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
