"use client"

import { useActionState, useEffect, useState } from "react"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TipoSolicitacao } from "@/generated/prisma/enums"
import { TIPO_SOLICITACAO_LABEL } from "@/lib/status-labels"
import { criarSolicitacao, type ActionResult } from "./actions"
import type { FuncionarioOption } from "./types"

interface NovaSolicitacaoDialogProps {
  funcionarios: FuncionarioOption[]
}

const initialState: ActionResult = { success: false, message: "" }

export function NovaSolicitacaoDialog({ funcionarios }: NovaSolicitacaoDialogProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(criarSolicitacao, initialState)

  useEffect(() => {
    if (!state.message) return
    if (state.success) {
      toast.success(state.message)
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
            <Plus />
            Nova Solicitação
          </Button>
        }
      />
      <DialogContent>
        {/* O conteúdo do Dialog do base-ui desmonta ao fechar, então o form
            abaixo sempre nasce zerado numa reabertura. */}
        <form action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Nova solicitação</DialogTitle>
            <DialogDescription>
              Registre uma solicitação para revisão na Visão Geral.
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

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de solicitação</Label>
            <Select name="tipo" required defaultValue={TipoSolicitacao.FERIAS}>
              <SelectTrigger id="tipo" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TipoSolicitacao).map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {TIPO_SOLICITACAO_LABEL[tipo]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="justificativa">Justificativa / Detalhes</Label>
            <Textarea
              id="justificativa"
              name="justificativa"
              placeholder="Descreva o motivo da solicitação..."
              rows={3}
              required
              minLength={5}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Enviando..." : "Enviar solicitação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
