/**
 * Funções de formatação para exibição na interface (não alteram dados da API).
 */

/** Número ou string → "R$ 120,00" no padrão brasileiro */
export function formatCurrency(valor) {
  const numero = typeof valor === "string" ? parseFloat(valor) : valor;
  if (Number.isNaN(numero)) return valor;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
}

/** Variação percentual com sinal (+12% ou -5%) */
export function formatVariacaoPercentual(valor) {
  const n = Number(valor);
  const sinal = n >= 0 ? "+" : "";
  return `${sinal}${n}%`;
}
