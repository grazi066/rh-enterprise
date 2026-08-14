import type { LucideIcon } from "lucide-react"
import {
  Banknote,
  Briefcase,
  CalendarClock,
  ClipboardCheck,
  HeartHandshake,
  LayoutDashboard,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "Geral",
    items: [
      { title: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
      { title: "Colaboradores", href: "/colaboradores", icon: Users },
      { title: "Férias e Ausências", href: "/ferias", icon: CalendarClock },
      { title: "Folha de Pagamento", href: "/folha", icon: Banknote },
      { title: "Solicitações", href: "/aprovacoes", icon: ClipboardCheck },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { title: "Cargos e Departamentos", href: "/cargos", icon: Briefcase },
      { title: "Benefícios", href: "/beneficios", icon: HeartHandshake },
    ],
  },
  {
    label: "Análises",
    items: [
      { title: "Filtros e Métricas", href: "/filtros", icon: SlidersHorizontal },
    ],
  },
  {
    label: "Segurança",
    items: [
      { title: "Auditoria & Segurança", href: "/auditoria", icon: ShieldCheck },
    ],
  },
]

export const navItems: NavItem[] = navGroups.flatMap((group) => group.items)
