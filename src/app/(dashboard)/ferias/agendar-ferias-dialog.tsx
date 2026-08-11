"use client"

import { useActionState, useEffect, useState } from "react"
import { CalendarPlus } from "lucide-react"
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
import { createFerias, type ActionResult } from "./actions"
import type { FuncionarioOption } from "./types"

interface AgendarFeriasDialogProps {
  funcionarios: FuncionarioOption[]
}

const initialState: ActionResult = { success: false, message: "" }

function calcularDias(inicio: string, fim: string): number | null {
  if (!inicio || !fim) return null
  const dataInicio = new Date(inicio)
  const dataFim = new Date(fim)
  if (Number.isNaN(dataInicio.getTime()) || Number.isNaN(dataFim.getTime())) {
    return null
  }
  const diff = Math.round(
    (dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)
  )
  return diff >= 0 ? diff + 1 : null
}

export function AgendarFeriasDialog({ funcionarios }: AgendarFeriasDialogProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(createFerias, initialState)

  useEffect(() => {
    if (!state.message) return
    if (state.success) {
      toast.success(state.message)
      // Fechar o modal é uma resposta ao resultado da Server Action (um
      // sistema externo), não uma sincronização de prop→estado — caso
      // legítimo de setState em effect que o lint ainda assim sinaliza.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false)
    } else {
      toast.error(state.message)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <CalendarPlus />
            Agendar Férias
          </Button>
        }
      />
      <DialogContent>
        {/* O conteúdo do Dialog do base-ui desmonta quando fecha, então os
            campos abaixo (num componente à parte) sempre nascem zerados —
            sem precisar de um useEffect de reset (ver CLAUDE.md). */}
        <AgendarFeriasForm
          funcionarios={funcionarios}
          formAction={formAction}
          pending={pending}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface AgendarFeriasFormProps {
  funcionarios: FuncionarioOption[]
  formAction: (formData: FormData) => void
  pending: boolean
  onCancel: () => void
}

function AgendarFeriasForm({
  funcionarios,
  formAction,
  pending,
  onCancel,
}: AgendarFeriasFormProps) {
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [dias, setDias] = useState("")
  const [diasEditadoManualmente, setDiasEditadoManualmente] = useState(false)

  function handleDataInicioChange(value: string) {
    setDataInicio(value)
    if (!diasEditadoManualmente) {
      const calculado = calcularDias(value, dataFim)
      setDias(calculado !== null ? String(calculado) : "")
    }
  }

  function handleDataFimChange(value: string) {
    setDataFim(value)
    if (!diasEditadoManualmente) {
      const calculado = calcularDias(dataInicio, value)
      setDias(calculado !== null ? String(calculado) : "")
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Agendar férias</DialogTitle>
        <DialogDescription>
          Selecione o colaborador e o período. Períodos sobrepostos aos já
          registrados não são permitidos.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="funcionarioId">Colaborador</Label>
        <Select name="funcionarioId" required>
          <SelectTrigger id="funcionarioId" className="w-full">
            <SelectValue placeholder="Selecione o colaborador">
              {(value: string | null) => {
                if (!value) return "Selecione o colaborador"
                const funcionario = funcionarios.find((f) => f.id === value)
                return funcionario
                  ? `${funcionario.nome} · ${funcionario.departamento}`
                  : value
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {funcionarios.map((funcionario) => (
              <SelectItem key={funcionario.id} value={funcionario.id}>
                {funcionario.nome} · {funcionario.departamento}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dataInicio">Data de início</Label>
          <Input
            id="dataInicio"
            name="dataInicio"
            type="date"
            value={dataInicio}
            onChange={(event) => handleDataInicioChange(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dataFim">Data de fim</Label>
          <Input
            id="dataFim"
            name="dataFim"
            type="date"
            value={dataFim}
            onChange={(event) => handleDataFimChange(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dias">Total de dias</Label>
        <Input
          id="dias"
          name="dias"
          type="number"
          min={1}
          value={dias}
          onChange={(event) => {
            setDiasEditadoManualmente(true)
            setDias(event.target.value)
          }}
          required
        />
        <p className="text-xs text-muted-foreground">
          Calculado automaticamente a partir das datas — ajuste se precisar.
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Agendando..." : "Agendar"}
        </Button>
      </DialogFooter>
    </form>
  )
}
