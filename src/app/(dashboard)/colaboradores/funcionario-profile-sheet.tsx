"use client"

import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ColoredAvatar } from "@/components/colored-avatar"
import { FuncionarioStatusBadge } from "@/components/funcionario-status-badge"
import { BeneficioTipoBadge } from "@/components/beneficio-badge"
import { currencyFormatter, formatCpf } from "@/lib/format"
import type { FuncionarioDTO, HistoricoSalarioItem } from "./types"

interface FuncionarioProfileSheetProps {
  funcionario: FuncionarioDTO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
}

function SalaryTimeline({ items }: { items: HistoricoSalarioItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma alteração salarial registrada ainda.
      </p>
    )
  }

  return (
    <ol>
      {items.map((item, index) => (
        <li key={item.id} className="relative flex gap-3 pb-6 last:pb-0">
          <div className="flex flex-col items-center">
            <span className="mt-1 flex size-2.5 shrink-0 rounded-full bg-primary ring-4 ring-primary/15" />
            {index < items.length - 1 && (
              <span className="w-px flex-1 bg-border" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">
                {currencyFormatter.format(item.valor)}
              </p>
              <p className="shrink-0 text-xs text-muted-foreground">
                {new Date(item.dataAlteracao).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">{item.motivo}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function FuncionarioProfileSheet({
  funcionario,
  open,
  onOpenChange,
  onEdit,
}: FuncionarioProfileSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        {funcionario && (
          <>
            <SheetHeader className="gap-3 border-b pb-4">
              <div className="flex items-start gap-3">
                <ColoredAvatar
                  name={funcionario.nome}
                  className="size-14 text-base"
                />
                <div className="min-w-0 flex-1 pt-0.5">
                  <SheetTitle className="truncate text-lg">
                    {funcionario.nome}
                  </SheetTitle>
                  <SheetDescription>
                    {funcionario.cargo.nome} · {funcionario.cargo.departamento}
                  </SheetDescription>
                  <div className="mt-2">
                    <FuncionarioStatusBadge status={funcionario.status} />
                  </div>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
              <section className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="truncate">{funcionario.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CPF</p>
                  <p>{formatCpf(funcionario.cpf)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Admissão</p>
                  <p>
                    {new Date(funcionario.dataAdmissao).toLocaleDateString(
                      "pt-BR"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Salário atual
                  </p>
                  <p className="font-medium">
                    {currencyFormatter.format(funcionario.salarioAtual)}
                  </p>
                </div>
              </section>

              <Separator />

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">
                  Benefícios{" "}
                  <span className="font-normal text-muted-foreground">
                    ({funcionario.beneficios.length})
                  </span>
                </h3>
                {funcionario.beneficios.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum benefício vinculado.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {funcionario.beneficios.map((item) => (
                      <li
                        key={item.beneficioId}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border p-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <BeneficioTipoBadge tipo={item.beneficio.tipo} />
                          <span className="truncate text-sm">
                            {item.beneficio.nome}
                          </span>
                        </div>
                        <span className="shrink-0 text-sm font-medium">
                          {currencyFormatter.format(
                            item.valorCustomizado ?? item.beneficio.valorPadrao
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <Separator />

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Histórico Salarial</h3>
                <SalaryTimeline items={funcionario.historicoSalarios} />
              </section>
            </div>

            <SheetFooter className="border-t">
              <Button onClick={onEdit} className="w-full">
                <Pencil />
                Editar colaborador
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
