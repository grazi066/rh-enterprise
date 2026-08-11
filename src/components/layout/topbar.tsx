import { Bell, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserMenu } from "@/components/layout/user-menu"

export function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-6">
      <div className="relative w-full max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar colaboradores, solicitações..."
          className="pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Notificações">
          <Bell className="size-4" />
        </Button>
        <UserMenu />
      </div>
    </header>
  )
}
