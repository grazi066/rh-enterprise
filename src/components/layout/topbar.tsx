import { Bell, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserMenu } from "@/components/layout/user-menu"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"

export function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card/80 px-4 backdrop-blur-sm sm:gap-4 sm:px-6">
      <MobileSidebar />

      <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar colaboradores, solicitações..."
          className="pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-3">
        <Button variant="ghost" size="icon" aria-label="Notificações">
          <Bell className="size-4" />
        </Button>
        <UserMenu />
      </div>
    </header>
  )
}
