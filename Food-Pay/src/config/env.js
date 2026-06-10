/**
 * Variáveis de ambiente lidas do .env via Vite (prefixo VITE_*).
 *
 * VITE_API_URL   – URL base da API, ex.: https://api.foodpay.com.br
 * VITE_USE_MOCK  – "false" ativa chamadas reais; qualquer outro valor usa mocks locais
 */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",

  /**
   * Quando true, os services retornam dados de mocks/data.js sem nenhuma
   * chamada de rede — útil para desenvolvimento sem backend disponível.
   */
  useMock: import.meta.env.VITE_USE_MOCK !== "false",
};
