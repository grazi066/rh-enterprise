import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getAvatarColor, getInitials } from "@/lib/avatar-color"
import { cn } from "@/lib/utils"

interface ColoredAvatarProps {
  name: string
  className?: string
}

export function ColoredAvatar({ name, className }: ColoredAvatarProps) {
  return (
    <Avatar className={cn("size-9", className)}>
      <AvatarFallback className={cn("text-xs font-medium", getAvatarColor(name))}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
