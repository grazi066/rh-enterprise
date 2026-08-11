"use client"

import { ChevronDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectFilterProps {
  label: string
  options: MultiSelectOption[]
  selected: string[]
  onChange: (values: string[]) => void
}

export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
}: MultiSelectFilterProps) {
  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    )
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" className="justify-between gap-2 font-normal">
            <span className="flex items-center gap-2">
              {label}
              {selected.length > 0 && (
                <Badge variant="secondary" className="rounded-full px-1.5">
                  {selected.length}
                </Badge>
              )}
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        }
      />
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>Nada encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  data-checked={selected.includes(option.value)}
                  onSelect={() => toggle(option.value)}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
