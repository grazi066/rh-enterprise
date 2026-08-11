"use client"

import { useMemo, useState } from "react"
import { Download, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { MultiSelectFilter } from "@/components/multi-select-filter"
import { currencyFormatter, formatCpf } from "@/lib/format"
import { STATUS_FUNCIONARIO_LABEL } from "@/lib/status-labels"
import { StatusFuncionario } from "@/generated/prisma/enums"
import type { FuncionarioFiltroDTO } from "./types"

interface FiltrosClientProps {
  funcionarios: FuncionarioFiltroDTO[]
  departamentos: string[]
  cargos: { id: string; label: string }[]
}

const STATUS_OPTIONS = Object.values(StatusFuncionario).map((status) => ({
  value: status,
  label: STATUS_FUNCIONARIO_LABEL[status],
}))

function escapeCsvField(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function exportarCsv(funcionarios: FuncionarioFiltroDTO[]) {
  const cabecalho = [
    "Nome",
    "CPF",
    "E-mail",
    "Cargo",
    "Departamento",
    "Status",
    "Data de Admissão",
    "Salário Atual",
  ]
  const linhas = funcionarios.map((funcionario) =>
    [
      funcionario.nome,
      formatCpf(funcionario.cpf),
      funcionario.email,
      funcionario.cargo.nome,
      funcionario.cargo.departamento,
      STATUS_FUNCIONARIO_LABEL[funcionario.status],
      new Date(funcionario.dataAdmissao).toLocaleDateString("pt-BR"),
      funcionario.salarioAtual.toFixed(2).replace(".", ","),
    ]
      .map(escapeCsvField)
      .join(",")
  )
  const csv = [cabecalho.join(","), ...linhas].join("\n")
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `colaboradores-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function FiltrosClient({
  funcionarios,
  departamentos,
  cargos,
}: FiltrosClientProps) {
  const [busca, setBusca] = useState("")
  const [departamentosSelecionados, setDepartamentosSelecionados] = useState<string[]>([])
  const [cargosSelecionados, setCargosSelecionados] = useState<string[]>([])
  const [statusSelecionados, setStatusSelecionados] = useState<string[]>([])
  const [salarioMin, setSalarioMin] = useState("")
  const [salarioMax, setSalarioMax] = useState("")
  const [admissaoInicio, setAdmissaoInicio] = useState("")
  const [admissaoFim, setAdmissaoFim] = useState("")

  const departamentoOptions = useMemo(
    () => departamentos.map((departamento) => ({ value: departamento, label: departamento })),
    [departamentos]
  )
  const cargoOptions = useMemo(
    () => cargos.map((cargo) => ({ value: cargo.id, label: cargo.label })),
    [cargos]
  )

  const filtrados = useMemo(() => {
    const buscaNormalizada = busca.trim().toLowerCase()
    const min = salarioMin === "" ? null : Number(salarioMin)
    const max = salarioMax === "" ? null : Number(salarioMax)
    const inicio = admissaoInicio ? new Date(admissaoInicio) : null
    const fim = admissaoFim ? new Date(admissaoFim) : null

    return funcionarios.filter((funcionario) => {
      if (buscaNormalizada) {
        const alvo = `${funcionario.nome} ${funcionario.cpf}`.toLowerCase()
        if (!alvo.includes(buscaNormalizada)) return false
      }
      if (
        departamentosSelecionados.length > 0 &&
        !departamentosSelecionados.includes(funcionario.cargo.departamento)
      ) {
        return false
      }
      if (
        cargosSelecionados.length > 0 &&
        !cargosSelecionados.includes(funcionario.cargo.id)
      ) {
        return false
      }
      if (
        statusSelecionados.length > 0 &&
        !statusSelecionados.includes(funcionario.status)
      ) {
        return false
      }
      if (min !== null && funcionario.salarioAtual < min) return false
      if (max !== null && funcionario.salarioAtual > max) return false
      if (inicio && new Date(funcionario.dataAdmissao) < inicio) return false
      if (fim && new Date(funcionario.dataAdmissao) > fim) return false
      return true
    })
  }, [
    funcionarios,
    busca,
    departamentosSelecionados,
    cargosSelecionados,
    statusSelecionados,
    salarioMin,
    salarioMax,
    admissaoInicio,
    admissaoFim,
  ])

  const filtrosAtivos =
    busca !== "" ||
    departamentosSelecionados.length > 0 ||
    cargosSelecionados.length > 0 ||
    statusSelecionados.length > 0 ||
    salarioMin !== "" ||
    salarioMax !== "" ||
    admissaoInicio !== "" ||
    admissaoFim !== ""

  function limparFiltros() {
    setBusca("")
    setDepartamentosSelecionados([])
    setCargosSelecionados([])
    setStatusSelecionados([])
    setSalarioMin("")
    setSalarioMax("")
    setAdmissaoInicio("")
    setAdmissaoFim("")
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              className="max-w-xs"
            />
            <MultiSelectFilter
              label="Departamento"
              options={departamentoOptions}
              selected={departamentosSelecionados}
              onChange={setDepartamentosSelecionados}
            />
            <MultiSelectFilter
              label="Cargo"
              options={cargoOptions}
              selected={cargosSelecionados}
              onChange={setCargosSelecionados}
            />
            <MultiSelectFilter
              label="Status"
              options={STATUS_OPTIONS}
              selected={statusSelecionados}
              onChange={setStatusSelecionados}
            />
            {filtrosAtivos && (
              <Button variant="ghost" size="sm" onClick={limparFiltros}>
                <X />
                Limpar filtros
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-4 border-t border-border pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="salarioMin" className="text-xs text-muted-foreground">
                Salário mínimo
              </Label>
              <Input
                id="salarioMin"
                type="number"
                min={0}
                placeholder="R$ 0"
                value={salarioMin}
                onChange={(event) => setSalarioMin(event.target.value)}
                className="w-32"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salarioMax" className="text-xs text-muted-foreground">
                Salário máximo
              </Label>
              <Input
                id="salarioMax"
                type="number"
                min={0}
                placeholder="Sem limite"
                value={salarioMax}
                onChange={(event) => setSalarioMax(event.target.value)}
                className="w-32"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admissaoInicio" className="text-xs text-muted-foreground">
                Admitidos a partir de
              </Label>
              <Input
                id="admissaoInicio"
                type="date"
                value={admissaoInicio}
                onChange={(event) => setAdmissaoInicio(event.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admissaoFim" className="text-xs text-muted-foreground">
                Admitidos até
              </Label>
              <Input
                id="admissaoFim"
                type="date"
                value={admissaoFim}
                onChange={(event) => setAdmissaoFim(event.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtrados.length} de {funcionarios.length} colaboradores
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportarCsv(filtrados)}
          disabled={filtrados.length === 0}
        >
          <Download />
          Exportar CSV
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome / CPF</TableHead>
              <TableHead>Cargo / Departamento</TableHead>
              <TableHead>Admissão</TableHead>
              <TableHead>Salário Atual</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Nenhum colaborador corresponde aos filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((funcionario) => (
                <TableRow key={funcionario.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ColoredAvatar name={funcionario.nome} />
                      <div className="min-w-0">
                        <p className="truncate font-medium leading-tight">
                          {funcionario.nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCpf(funcionario.cpf)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="leading-tight">{funcionario.cargo.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {funcionario.cargo.departamento}
                    </p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(funcionario.dataAdmissao).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    {currencyFormatter.format(funcionario.salarioAtual)}
                  </TableCell>
                  <TableCell>
                    <FuncionarioStatusBadge status={funcionario.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
