"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CircleCheck, MessageSquareText, MoreVertical, Pencil } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ColoredAvatar } from "@/components/colored-avatar"
import { ItemFolhaStatusBadge } from "@/components/folha-status-badge"
import { currencyFormatter } from "@/lib/format"
import { StatusItemFolha } from "@/generated/prisma/enums"
import { marcarItemComoPago, processarFolhaCompleta } from "./actions"
import { EditarItemDialog } from "./editar-item-dialog"
import type { FolhaDTO, ItemFolhaDTO } from "./types"

const FILTRO_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: StatusItemFolha.PENDENTE, label: "Pendente" },
  { value: StatusItemFolha.PAGO, label: "Pago" },
]

export function FolhaTable({ folha }: { folha: FolhaDTO }) {
  const router = useRouter()
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [busca, setBusca] = useState("")
  const [editando, setEditando] = useState<ItemFolhaDTO | null>(null)
  const [itemPendente, startItemTransition] = useTransition()
  const [processandoTudo, startProcessarTransition] = useTransition()
  const [itemEmAndamento, setItemEmAndamento] = useState<string | null>(null)

  const itensFiltrados = useMemo(() => {
    const buscaNormalizada = busca.trim().toLowerCase()
    return folha.itens.filter((item) => {
      if (filtroStatus !== "todos" && item.status !== filtroStatus) return false
      if (buscaNormalizada && !item.funcionario.nome.toLowerCase().includes(buscaNormalizada)) {
        return false
      }
      return true
    })
  }, [folha.itens, filtroStatus, busca])

  const pendentes = folha.itens.filter(
    (item) => item.status === StatusItemFolha.PENDENTE
  ).length

  function handleMarcarComoPago(itemId: string) {
    setItemEmAndamento(itemId)
    startItemTransition(async () => {
      const result = await marcarItemComoPago(itemId)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
      setItemEmAndamento(null)
    })
  }

  function handleProcessarFolhaCompleta() {
    startProcessarTransition(async () => {
      const result = await processarFolhaCompleta(folha.id)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Buscar colaborador..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            className="w-56"
          />
          <Select
            value={filtroStatus}
            onValueChange={(value) => setFiltroStatus(value ?? "todos")}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTRO_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          onClick={handleProcessarFolhaCompleta}
          disabled={processandoTudo || pendentes === 0}
        >
          <CircleCheck />
          {processandoTudo
            ? "Processando..."
            : `Processar Folha Completa (${pendentes} pendente${pendentes === 1 ? "" : "s"})`}
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colaborador</TableHead>
              <TableHead>Cargo / Departamento</TableHead>
              <TableHead>Salário Base</TableHead>
              <TableHead>Benefícios</TableHead>
              <TableHead>Descontos</TableHead>
              <TableHead>Valor Líquido</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itensFiltrados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Nenhum item corresponde aos filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              itensFiltrados.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ColoredAvatar name={item.funcionario.nome} />
                      <span className="font-medium">{item.funcionario.nome}</span>
                      {item.observacao && (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <span className="text-muted-foreground">
                                <MessageSquareText className="size-3.5" />
                              </span>
                            }
                          />
                          <TooltipContent>{item.observacao}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="leading-tight">{item.funcionario.cargo.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.funcionario.cargo.departamento}
                    </p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {currencyFormatter.format(item.salarioBruto)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {currencyFormatter.format(item.funcionario.beneficiosTotal)}
                  </TableCell>
                  <TableCell className="text-destructive">
                    -{currencyFormatter.format(item.descontos)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {currencyFormatter.format(item.valorLiquido)}
                  </TableCell>
                  <TableCell>
                    <ItemFolhaStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status === StatusItemFolha.PENDENTE ? (
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
                          <DropdownMenuItem onClick={() => setEditando(item)}>
                            <Pencil />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleMarcarComoPago(item.id)}
                            disabled={itemPendente && itemEmAndamento === item.id}
                          >
                            <CircleCheck />
                            {itemPendente && itemEmAndamento === item.id
                              ? "Marcando..."
                              : "Marcar como Pago"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {item.dataPagamento
                          ? new Date(item.dataPagamento).toLocaleDateString("pt-BR")
                          : "—"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditarItemDialog
        item={editando}
        open={!!editando}
        onOpenChange={(open) => !open && setEditando(null)}
      />
    </div>
  )
}
