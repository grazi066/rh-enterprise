"use client"

import { useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FolhaPeriodoPickerProps {
  mes: number
  ano: number
}

export function FolhaPeriodoPicker({ mes, ano }: FolhaPeriodoPickerProps) {
  const router = useRouter()
  const value = `${ano}-${String(mes).padStart(2, "0")}`

  function handleChange(novoValor: string) {
    if (!novoValor) return
    const [novoAno, novoMes] = novoValor.split("-")
    router.push(`/folha?mes=${Number(novoMes)}&ano=${novoAno}`)
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor="periodo" className="text-xs text-muted-foreground">
        Período
      </Label>
      <Input
        id="periodo"
        type="month"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        className="w-40"
      />
    </div>
  )
}
