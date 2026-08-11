"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { FilePlus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { gerarFolha } from "./actions"

interface GerarFolhaButtonProps {
  mes: number
  ano: number
}

export function GerarFolhaButton({ mes, ano }: GerarFolhaButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await gerarFolha(mes, ano)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Button onClick={handleClick} disabled={isPending}>
      <FilePlus />
      {isPending ? "Gerando..." : "Gerar Folha do Período"}
    </Button>
  )
}
