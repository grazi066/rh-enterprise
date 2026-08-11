// Cores decorativas de avatar, hasheadas a partir do nome — não carregam
// significado de status (ver funcionario-status-badge.tsx para isso).
const AVATAR_PALETTE = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
  "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-400",
  "bg-lime-100 text-lime-700 dark:bg-lime-500/15 dark:text-lime-400",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400",
  "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
] as const

export function getAvatarColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length
  return AVATAR_PALETTE[index]
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}
