const FUSO_BRASILIA = "America/Sao_Paulo"

// Formata a data de referência como "AAAA-MM-DD" no fuso de Brasília e
// reconstrói o instante UTC correspondente a 00:00:00 desse dia local.
// Não usamos o truque de `new Date(date.toLocaleString(...))` seguido de
// `setHours(0,0,0,0)`: aquele round-trip zera as horas no fuso do
// *servidor* (UTC em produção), não no fuso de Brasília — e como Brasília
// é UTC-3, o resultado fica 3h adiantado em relação à meia-noite real,
// contando registros da noite anterior como "hoje". Construir o instante
// diretamente com o offset "-03:00" é correto independente do fuso do
// servidor (Brasília não tem mais horário de verão desde 2019, então o
// offset fixo é seguro).
export function inicioDoDiaEmBrasilia(referencia = new Date()): Date {
  const dataLocal = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_BRASILIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(referencia)

  return new Date(`${dataLocal}T00:00:00-03:00`)
}
