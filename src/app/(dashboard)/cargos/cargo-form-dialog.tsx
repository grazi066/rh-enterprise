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
import { createCargo, updateCargo, type ActionResult } from "./actions"

export interface CargoDTO {
  id: string
  nome: string
  departamento: string
  salarioBase: number
}

interface CargoFormDialogProps {
  mode: "create" | "edit"
  cargo?: CargoDTO
  departamentosExistentes: string[]
  trigger?: ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const initialState: ActionResult = { success: false, message: "" }

export function CargoFormDialog({
  mode,
  cargo,
  departamentosExistentes,
  trigger,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: CargoFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen
  const setOpen = isControlled ? onOpenChangeProp! : setInternalOpen

  const action = mode === "create" ? createCargo : updateCargo
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

  const datalistId = `departamentos-existentes-${mode}-${cargo?.id ?? "novo"}`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger
          render={
            trigger ?? (
              <Button>
                <Plus />
                Novo Cargo
              </Button>
            )
          }
        />
      )}
      <DialogContent>
        <form action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Novo cargo" : "Editar cargo"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Cadastre um novo cargo e o departamento ao qual ele pertence."
                : "Atualize as informações do cargo."}
            </DialogDescription>
          </DialogHeader>

          {mode === "edit" && cargo && (
            <input type="hidden" name="id" value={cargo.id} />
          )}

          <div className="space-y-2">
            <Label htmlFor={`nome-${datalistId}`}>Nome do cargo</Label>
            <Input
              id={`nome-${datalistId}`}
              name="nome"
              defaultValue={cargo?.nome}
              placeholder="Ex.: Analista de RH Pleno"
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`departamento-${datalistId}`}>Departamento</Label>
            <Input
              id={`departamento-${datalistId}`}
              name="departamento"
              defaultValue={cargo?.departamento}
              placeholder="Ex.: Recursos Humanos"
              list={datalistId}
              required
              minLength={2}
            />
            <datalist id={datalistId}>
              {departamentosExistentes.map((departamento) => (
                <option key={departamento} value={departamento} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`salarioBase-${datalistId}`}>
              Salário-base (R$)
            </Label>
            <Input
              id={`salarioBase-${datalistId}`}
              name="salarioBase"
              type="number"
              min={0}
              step="0.01"
              defaultValue={cargo?.salarioBase}
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
