"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { SidebarNavContent } from "@/components/layout/sidebar"

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [lastPathname, setLastPathname] = useState(pathname)

  // Fecha o drawer ao navegar, sem useEffect: ajustar estado durante a
  // renderização (em vez de num efeito) evita o cascading render que a regra
  // react-hooks/set-state-in-effect aponta.
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Abrir menu"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-4" />
      </Button>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-64 gap-0 bg-sidebar p-0 text-sidebar-foreground sm:max-w-64"
      >
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <SidebarNavContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
