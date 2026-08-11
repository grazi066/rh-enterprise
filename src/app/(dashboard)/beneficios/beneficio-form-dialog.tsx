"use client"

import { useEffect, useState, type ReactElement } from "react"
import { useActionState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TipoBeneficio } from "@/generated/prisma/enums"
import { TIPO_BENEFICIO_CONFIG } from "@/components/beneficio-badge"
import {
  createBeneficio,
  updateBeneficio,
  type ActionResult,
} from "./actions"

export interface BeneficioDTO {
  id: string
  nome: string
  tipo: TipoBeneficio
  valorPadrao: number
}

interface BeneficioFormDialogProps {
  mode: "create" | "edit"
  beneficio?: BeneficioDTO
  trigger?: ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const initialState: ActionResult = { success: false, message: "" }

export function BeneficioFormDialog({
  mode,
  beneficio,
  trigger,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: BeneficioFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen
  const setOpen = isControlled ? onOpenChangeProp! : setInternalOpen

  const action = mode === "create" ? createBeneficio : updateBeneficio
  const [state, formAction, pending] = useActionState(action, initialState)

  useEffect(() => {
    if (!state.message) return
    if (state.success) {
      toast.success(state.message)
      setOpen(false)
    } else {
      toast.error(state.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const fieldId = `beneficio-${mode}-${beneficio?.id ?? "novo"}`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger
          render={
            trigger ?? (
              <Button>
                <Plus />
                Novo Benefício
              </Button>
            )
          }
        />
      )}
      <DialogContent>
        <form action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Novo benefício" : "Editar benefício"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Cadastre um novo benefício do catálogo da empresa."
                : "Atualize as informações do benefício."}
            </DialogDescription>
          </DialogHeader>

          {mode === "edit" && beneficio && (
            <input type="hidden" name="id" value={beneficio.id} />
          )}

          <div className="space-y-2">
            <Label htmlFor={`nome-${fieldId}`}>Nome do benefício</Label>
            <Input
              id={`nome-${fieldId}`}
              name="nome"
              defaultValue={beneficio?.nome}
              placeholder="Ex.: Plano de Saúde Premium"
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`tipo-${fieldId}`}>Tipo</Label>
            <Select name="tipo" defaultValue={beneficio?.tipo}>
              <SelectTrigger id={`tipo-${fieldId}`} className="w-full">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TipoBeneficio).map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {TIPO_BENEFICIO_CONFIG[tipo].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`valorPadrao-${fieldId}`}>
              Valor padrão (R$)
            </Label>
            <Input
              id={`valorPadrao-${fieldId}`}
              name="valorPadrao"
              type="number"
              min={0}
              step="0.01"
              defaultValue={beneficio?.valorPadrao}
              placeholder="0,00"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
