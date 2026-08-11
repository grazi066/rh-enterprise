"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { currencyFormatter } from "@/lib/format"
import { editarItemFolha, type ActionResult } from "./actions"
import type { ItemFolhaDTO } from "./types"

interface EditarItemDialogProps {
  item: ItemFolhaDTO | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const initialState: ActionResult = { success: false, message: "" }

export function EditarItemDialog({ item, open, onOpenChange }: EditarItemDialogProps) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(editarItemFolha, initialState)

  useEffect(() => {
    if (!state.message) return
    if (state.success) {
      toast.success(state.message)
      onOpenChange(false)
      router.refresh()
    } else {
      toast.error(state.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* item nasce fixo por reabertura (Dialog do base-ui desmonta ao
            fechar), não precisa de useEffect pra ressincronizar campos. */}
        {item && (
          <EditarItemForm
            item={item}
            formAction={formAction}
            pending={pending}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface EditarItemFormProps {
  item: ItemFolhaDTO
  formAction: (formData: FormData) => void
  pending: boolean
  onCancel: () => void
}

function EditarItemForm({ item, formAction, pending, onCancel }: EditarItemFormProps) {
  const [salarioBruto, setSalarioBruto] = useState(String(item.salarioBruto))
  const [descontos, setDescontos] = useState(String(item.descontos))

  const valorLiquidoPreview = Math.max(0, (Number(salarioBruto) || 0) - (Number(descontos) || 0))

  return (
    <form action={formAction} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Editar item da folha</DialogTitle>
        <DialogDescription>
          {item.funcionario.nome} · {item.funcionario.cargo.nome}
        </DialogDescription>
      </DialogHeader>

      <input type="hidden" name="itemId" value={item.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="salarioBruto">Salário bruto (R$)</Label>
          <Input
            id="salarioBruto"
            name="salarioBruto"
            type="number"
            min={0}
            step="0.01"
            value={salarioBruto}
            onChange={(event) => setSalarioBruto(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descontos">Descontos (R$)</Label>
          <Input
            id="descontos"
            name="descontos"
            type="number"
            min={0}
            step="0.01"
            value={descontos}
            onChange={(event) => setDescontos(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="rounded-lg border border-success/30 bg-success/5 p-3">
        <p className="text-xs text-muted-foreground">
          Valor líquido (recalculado em tempo real)
        </p>
        <p className="text-lg font-semibold text-success">
          {currencyFormatter.format(valorLiquidoPreview)}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacao">Observação (opcional)</Label>
        <Textarea
          id="observacao"
          name="observacao"
          defaultValue={item.observacao ?? ""}
          placeholder="Ex.: ajuste de horas extras, adiantamento, correção..."
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  )
}
