"use client"

import { useActionState, useEffect, useState, type ReactElement } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusFuncionario } from "@/generated/prisma/enums"
import { BeneficioTipoBadge } from "@/components/beneficio-badge"
import { currencyFormatter } from "@/lib/format"
import { STATUS_FUNCIONARIO_LABEL } from "@/lib/status-labels"
import {
  createFuncionario,
  updateFuncionario,
  type ActionResult,
} from "./actions"
import type { BeneficioOption, CargoOption, FuncionarioDTO } from "./types"

interface FuncionarioFormDialogProps {
  mode: "create" | "edit"
  funcionario?: FuncionarioDTO
  cargos: CargoOption[]
  beneficios: BeneficioOption[]
  trigger?: ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const initialState: ActionResult = { success: false, message: "" }

export function FuncionarioFormDialog({
  mode,
  funcionario,
  cargos,
  beneficios,
  trigger,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: FuncionarioFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen
  const setOpen = isControlled ? onOpenChangeProp! : setInternalOpen

  const action = mode === "create" ? createFuncionario : updateFuncionario
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger
          render={
            trigger ?? (
              <Button>
                <Plus />
                Novo Colaborador
              </Button>
            )
          }
        />
      )}
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        {/* key: remonta os campos (e seu estado local) sempre que o
            colaborador editado muda, em vez de sincronizar via useEffect —
            ver CLAUDE.md sobre o lint react-hooks/set-state-in-effect. */}
        <FuncionarioFormFields
          key={funcionario?.id ?? "novo"}
          mode={mode}
          funcionario={funcionario}
          cargos={cargos}
          beneficios={beneficios}
          formAction={formAction}
          pending={pending}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface FuncionarioFormFieldsProps {
  mode: "create" | "edit"
  funcionario?: FuncionarioDTO
  cargos: CargoOption[]
  beneficios: BeneficioOption[]
  formAction: (formData: FormData) => void
  pending: boolean
  onCancel: () => void
}

function FuncionarioFormFields({
  mode,
  funcionario,
  cargos,
  beneficios,
  formAction,
  pending,
  onCancel,
}: FuncionarioFormFieldsProps) {
  const [cargoId, setCargoId] = useState(funcionario?.cargo.id ?? "")
  const [salarioAtual, setSalarioAtual] = useState(
    funcionario ? String(funcionario.salarioAtual) : ""
  )
  const [beneficiosSelecionados, setBeneficiosSelecionados] = useState<
    Map<string, number | null>
  >(
    () =>
      new Map(
        funcionario?.beneficios.map((item) => [
          item.beneficioId,
          item.valorCustomizado,
        ]) ?? []
      )
  )

  const cargoSelecionado = cargos.find((cargo) => cargo.id === cargoId)
  const salarioAtualNumero = salarioAtual === "" ? null : Number(salarioAtual)
  const salarioAnterior = funcionario?.salarioAtual ?? null
  const salarioMudou =
    mode === "edit" &&
    salarioAnterior !== null &&
    salarioAtualNumero !== null &&
    salarioAtualNumero !== salarioAnterior

  function handleCargoChange(value: string) {
    setCargoId(value)
    if (mode === "create") {
      const cargo = cargos.find((item) => item.id === value)
      if (cargo) setSalarioAtual(String(cargo.salarioBase))
    }
  }

  function toggleBeneficio(beneficioId: string, checked: boolean) {
    setBeneficiosSelecionados((prev) => {
      const next = new Map(prev)
      if (checked) {
        next.set(beneficioId, null)
      } else {
        next.delete(beneficioId)
      }
      return next
    })
  }

  function setValorCustomizado(beneficioId: string, valor: string) {
    setBeneficiosSelecionados((prev) => {
      const next = new Map(prev)
      next.set(beneficioId, valor === "" ? null : Number(valor))
      return next
    })
  }

  const fieldId = `funcionario-${mode}-${funcionario?.id ?? "novo"}`

  return (
    <form action={formAction} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {mode === "create" ? "Novo colaborador" : "Editar colaborador"}
        </DialogTitle>
        <DialogDescription>
          {mode === "create"
            ? "Cadastre um novo colaborador, seu vínculo profissional e os benefícios."
            : "Atualize os dados, o vínculo profissional e os benefícios do colaborador."}
        </DialogDescription>
      </DialogHeader>

      {mode === "edit" && funcionario && (
        <input type="hidden" name="id" value={funcionario.id} />
      )}
      <input type="hidden" name="cargoId" value={cargoId} />
      <input type="hidden" name="salarioAtual" value={salarioAtual} />

      <Tabs defaultValue="pessoais">
        <TabsList className="w-full">
          <TabsTrigger value="pessoais" className="flex-1">
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger value="vinculo" className="flex-1">
            Vínculo Profissional
          </TabsTrigger>
          <TabsTrigger value="beneficios" className="flex-1">
            Benefícios
          </TabsTrigger>
        </TabsList>

        {/* keepMounted: o Tabs do base-ui desmonta painéis inativos por
            padrão, o que tiraria os campos deles do FormData no submit. */}
        <TabsContent value="pessoais" keepMounted className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor={`nome-${fieldId}`}>Nome completo</Label>
            <Input
              id={`nome-${fieldId}`}
              name="nome"
              defaultValue={funcionario?.nome}
              required
              minLength={2}
              placeholder="Ex.: Ana Beatriz Souza"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`email-${fieldId}`}>E-mail</Label>
              <Input
                id={`email-${fieldId}`}
                name="email"
                type="email"
                defaultValue={funcionario?.email}
                required
                placeholder="nome@rh-enterprise.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`cpf-${fieldId}`}>CPF</Label>
              <Input
                id={`cpf-${fieldId}`}
                name="cpf"
                defaultValue={funcionario?.cpf}
                required
                placeholder="Somente números"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`dataAdmissao-${fieldId}`}>Data de admissão</Label>
            <Input
              id={`dataAdmissao-${fieldId}`}
              name="dataAdmissao"
              type="date"
              defaultValue={
                funcionario ? funcionario.dataAdmissao.slice(0, 10) : undefined
              }
              required
            />
          </div>
        </TabsContent>

        <TabsContent value="vinculo" keepMounted className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor={`cargo-${fieldId}`}>Cargo</Label>
            <Select
              value={cargoId || undefined}
              onValueChange={(value) => handleCargoChange(String(value))}
            >
              <SelectTrigger id={`cargo-${fieldId}`} className="w-full">
                <SelectValue placeholder="Selecione o cargo" />
              </SelectTrigger>
              <SelectContent>
                {cargos.map((cargo) => (
                  <SelectItem key={cargo.id} value={cargo.id}>
                    {cargo.nome} · {cargo.departamento}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {cargoSelecionado && (
              <p className="text-xs text-muted-foreground">
                Salário-base deste cargo:{" "}
                {currencyFormatter.format(cargoSelecionado.salarioBase)}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`salarioAtualInput-${fieldId}`}>
                Salário atual (R$)
              </Label>
              <Input
                id={`salarioAtualInput-${fieldId}`}
                type="number"
                min={0}
                step="0.01"
                value={salarioAtual}
                onChange={(event) => setSalarioAtual(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`status-${fieldId}`}>Status</Label>
              <Select
                name="status"
                defaultValue={funcionario?.status ?? StatusFuncionario.ATIVO}
              >
                <SelectTrigger id={`status-${fieldId}`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(StatusFuncionario).map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_FUNCIONARIO_LABEL[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {salarioMudou && (
            <div className="space-y-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
              <Label htmlFor={`motivo-${fieldId}`}>
                Motivo da alteração salarial
              </Label>
              <Input
                id={`motivo-${fieldId}`}
                name="motivoAlteracaoSalarial"
                placeholder="Ex.: Promoção, reajuste anual, mérito..."
                required
              />
              <p className="text-xs text-muted-foreground">
                O salário muda de {currencyFormatter.format(salarioAnterior ?? 0)}{" "}
                para {currencyFormatter.format(salarioAtualNumero ?? 0)} — isso gera
                um novo registro no histórico salarial.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="beneficios" keepMounted className="space-y-3 pt-4">
          <p className="text-xs text-muted-foreground">
            Selecione os benefícios do colaborador. O valor customizado é
            opcional — sem ele, vale o valor padrão do benefício.
          </p>
          <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
            {beneficios.map((beneficio) => {
              const selecionado = beneficiosSelecionados.has(beneficio.id)
              const valorAtual = beneficiosSelecionados.get(beneficio.id)
              const checkboxId = `beneficio-${fieldId}-${beneficio.id}`

              return (
                <div
                  key={beneficio.id}
                  className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50"
                >
                  <Checkbox
                    id={checkboxId}
                    name="beneficio"
                    value={beneficio.id}
                    checked={selecionado}
                    onCheckedChange={(checked) =>
                      toggleBeneficio(beneficio.id, checked)
                    }
                  />
                  <label
                    htmlFor={checkboxId}
                    className="flex flex-1 cursor-pointer items-center gap-2 text-sm"
                  >
                    <BeneficioTipoBadge tipo={beneficio.tipo} />
                    {beneficio.nome}
                  </label>
                  {selecionado && (
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder={currencyFormatter.format(beneficio.valorPadrao)}
                      value={valorAtual ?? ""}
                      onChange={(event) =>
                        setValorCustomizado(beneficio.id, event.target.value)
                      }
                      name={`valorCustomizado_${beneficio.id}`}
                      className="w-28"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

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
