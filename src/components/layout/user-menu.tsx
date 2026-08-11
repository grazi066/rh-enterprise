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
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md py-1 pr-1 pl-2 text-left transition-colors hover:bg-muted focus-visible:outline-none">
        <div className="hidden text-right sm:block">
          <p className="text-sm leading-tight font-medium">
            {currentUser.name}
          </p>
          <p className="text-xs leading-tight text-muted-foreground">
            {currentUser.role}
          </p>
        </div>
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {currentUser.initials}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
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
