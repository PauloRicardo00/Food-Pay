/**
 * Utilitários de formatação para exibição na interface.
 * Não alteram os dados originais — apenas os preparam para leitura humana.
 */

/** Converte um número ou string numérica para o padrão monetário brasileiro: R$ 120,00 */
export function formatCurrency(valor) {
  const numero = typeof valor === "string" ? parseFloat(valor) : valor;
  if (Number.isNaN(numero)) return valor;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
}

/** Formata variação percentual com sinal explícito: +12% ou -5% */
export function formatVariacaoPercentual(valor) {
  const n = Number(valor);
  const sinal = n >= 0 ? "+" : "";
  return `${sinal}${n}%`;
}
