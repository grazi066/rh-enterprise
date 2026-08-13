import type { AppStatus } from "@/components/status-badge"

export interface Employee {
  id: string
  name: string
  role: string
  department: string
  status: AppStatus
  avatarUrl?: string
  email: string
  admissionDate: string
}
