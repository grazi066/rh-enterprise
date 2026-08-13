import type { Employee } from "@/types/hr"

// Sessão fictícia — sem autenticação real ainda. Ver CLAUDE.md.
export const currentUser = {
  name: "Ana Beatriz Souza",
  role: "Gerente de Recursos Humanos",
  email: "ana.souza@rh-enterprise.com",
  initials: "AB",
}

export const employees: Employee[] = [
  {
    id: "1",
    name: "Ana Beatriz Souza",
    role: "Analista de RH Sênior",
    department: "Recursos Humanos",
    status: "ativo",
    email: "ana.souza@rh-enterprise.com",
    admissionDate: "2021-03-14",
  },
  {
    id: "2",
    name: "Carlos Eduardo Lima",
    role: "Desenvolvedor Full Stack",
    department: "Tecnologia",
    status: "em_ferias",
    email: "carlos.lima@rh-enterprise.com",
    admissionDate: "2019-08-01",
  },
  {
    id: "3",
    name: "Fernanda Ribeiro",
    role: "Gerente Financeira",
    department: "Financeiro",
    status: "afastado",
    email: "fernanda.ribeiro@rh-enterprise.com",
    admissionDate: "2018-11-20",
  },
  {
    id: "4",
    name: "João Pedro Alves",
    role: "Assistente Administrativo",
    department: "Operações",
    status: "desligado",
    email: "joao.alves@rh-enterprise.com",
    admissionDate: "2022-01-10",
  },
  {
    id: "5",
    name: "Mariana Costa",
    role: "Product Designer",
    department: "Tecnologia",
    status: "ativo",
    email: "mariana.costa@rh-enterprise.com",
    admissionDate: "2020-05-22",
  },
]
