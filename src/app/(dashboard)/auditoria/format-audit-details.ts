import { STATUS_FUNCIONARIO_LABEL, TIPO_SOLICITACAO_LABEL } from "@/lib/status-labels"
import { currencyFormatter } from "@/lib/format"
import type { StatusFuncionario, TipoSolicitacao } from "@/generated/prisma/enums"

function parseDetalhes(detalhes: string | null): Record<string, unknown> | null {
  if (!detalhes) return null
  try {
    const parsed: unknown = JSON.parse(detalhes)
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function tipoSolicitacaoLabel(value: unknown): string | undefined {
  const tipo = asString(value)
  if (!tipo) return undefined
  return TIPO_SOLICITACAO_LABEL[tipo as TipoSolicitacao] ?? tipo
}

function statusFuncionarioLabel(value: unknown): string | undefined {
  const status = asString(value)
  if (!status) return undefined
  return STATUS_FUNCIONARIO_LABEL[status as StatusFuncionario] ?? status
}

function formatMoney(value: unknown): string | undefined {
  const numero = asNumber(value)
  return numero === undefined ? undefined : currencyFormatter.format(numero)
}

// Traduz o JSON bruto de AuditLog.detalhes para uma frase legível em
// português, específica de cada tipo de ação. Cai de volta na string crua
// (ou "—") quando a ação é desconhecida ou os campos esperados não estão
// presentes — nunca deve travar a tabela de auditoria.
export function formatAuditDetails(acao: string, detalhes: string | null): string {
  const dados = parseDetalhes(detalhes)
  if (!dados) return detalhes ?? "—"

  const funcionario = asString(dados.funcionario)
  const fallback = detalhes ?? "—"

  switch (acao) {
    case "CRIACAO_SOLICITACAO": {
      const tipo = tipoSolicitacaoLabel(dados.tipo)
      return tipo && funcionario ? `Solicitação de ${tipo} para ${funcionario}` : fallback
    }
    case "APROVACAO_SOLICITACAO": {
      const tipo = tipoSolicitacaoLabel(dados.tipo)
      return tipo && funcionario
        ? `Solicitação de ${tipo} aprovada para ${funcionario}`
        : fallback
    }
    case "REJEICAO_SOLICITACAO": {
      const tipo = tipoSolicitacaoLabel(dados.tipo)
      return tipo && funcionario
        ? `Solicitação de ${tipo} rejeitada para ${funcionario}`
        : fallback
    }
    case "ALTERACAO_SALARIO": {
      const anterior = formatMoney(dados.salarioAnterior)
      const novo = formatMoney(dados.salarioNovo)
      if (!anterior || !novo) return fallback
      const quem = funcionario ? ` — ${funcionario}` : ""
      return `Salário alterado de ${anterior} para ${novo}${quem}`
    }
    case "ALTERACAO_CARGO": {
      const anterior = asString(dados.cargoAnterior)
      const novo = asString(dados.cargoNovo)
      if (!anterior || !novo) return fallback
      const quem = funcionario ? ` — ${funcionario}` : ""
      return `Cargo alterado de ${anterior} para ${novo}${quem}`
    }
    case "ALTERACAO_STATUS": {
      const anterior = statusFuncionarioLabel(dados.statusAnterior)
      const novo = statusFuncionarioLabel(dados.statusNovo)
      if (!anterior || !novo) return fallback
      const quem = funcionario ? ` — ${funcionario}` : ""
      return `Status alterado de ${anterior} para ${novo}${quem}`
    }
    case "CRIACAO_COLABORADOR":
      return funcionario ? `Colaborador ${funcionario} cadastrado` : fallback
    case "EXCLUSAO_COLABORADOR":
      return funcionario ? `Colaborador ${funcionario} excluído` : fallback
    case "CRIACAO_CARGO": {
      const nome = asString(dados.nome)
      const departamento = asString(dados.departamento)
      if (!nome) return fallback
      return departamento ? `Cargo "${nome}" criado em ${departamento}` : `Cargo "${nome}" criado`
    }
    case "APROVACAO_FERIAS": {
      const dias = asNumber(dados.dias)
      if (!funcionario) return fallback
      return dias !== undefined
        ? `Férias de ${dias} dia(s) agendadas para ${funcionario}`
        : `Férias agendadas para ${funcionario}`
    }
    case "CANCELAMENTO_FERIAS":
      return funcionario ? `Férias canceladas para ${funcionario}` : fallback
    case "PAGAMENTO_FOLHA": {
      const valor = formatMoney(dados.valorLiquido)
      if (!funcionario || !valor) return fallback
      return `Pagamento de ${valor} confirmado para ${funcionario}`
    }
    default:
      return fallback
  }
}

// Justificativa é a única informação "extra" que ainda não aparece no
// resumo formatado (hoje só CRIACAO_SOLICITACAO carrega uma) — exibida à
// parte, numa Tooltip, em vez de poluir a frase principal da tabela.
export function getAuditJustificativa(detalhes: string | null): string | undefined {
  const dados = parseDetalhes(detalhes)
  return dados ? asString(dados.justificativa) : undefined
}
