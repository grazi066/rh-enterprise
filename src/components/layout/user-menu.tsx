"use client"

import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { currentUser } from "@/lib/mock-data"

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full py-1 pr-1 pl-2 text-left transition-colors hover:bg-muted focus-visible:outline-none">
        <div className="hidden text-right sm:block">
          <p className="text-sm leading-tight font-medium">
            {currentUser.name}
          </p>
          <p className="text-xs leading-tight text-muted-foreground">
            {currentUser.role}
          </p>
        </div>
        <Avatar className="size-8 ring-2 ring-primary/10">
          <AvatarFallback className="bg-slate-700 text-xs text-white dark:bg-slate-600">
            {currentUser.initials}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2.5 font-normal">
            <Avatar className="size-9 ring-2 ring-primary/10">
              <AvatarFallback className="bg-slate-700 text-xs text-white dark:bg-slate-600">
                {currentUser.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{currentUser.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {currentUser.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserRound />
          Meu perfil
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOut />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
