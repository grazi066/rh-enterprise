import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Status badges — bind these to domain status, not ad-hoc colors.
        // success: Ativo / Aprovado · warning: Em Férias · info: Pendente · away: Afastado
        success:
          "bg-success/10 text-success [a]:hover:bg-success/20 dark:bg-success/15",
        warning:
          "bg-warning/10 text-warning [a]:hover:bg-warning/20 dark:bg-warning/15",
        info: "bg-info/10 text-info [a]:hover:bg-info/20 dark:bg-info/15",
        away: "bg-away/10 text-away [a]:hover:bg-away/20 dark:bg-away/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Variantes de status (não as genéricas default/secondary/outline/ghost/link)
// ganham um status-dot colorido antes do rótulo — herda a cor do texto via
// bg-current, então o ponto sempre casa com o fundo pastel da variante.
const STATUS_DOT_VARIANTS = new Set([
  "success",
  "warning",
  "info",
  "away",
  "destructive",
])

function Badge({
  className,
  variant = "default",
  render,
  children,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  const showDot = STATUS_DOT_VARIANTS.has(variant ?? "default")

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      {
        ...props,
        children: (
          <>
            {showDot && (
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-current"
              />
            )}
            {children}
          </>
        ),
      }
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
