/**
 * Configuração lida do arquivo .env (variáveis VITE_*).
 * Centraliza URL da API e se usamos dados fictícios ou backend real.
 */
export const env = {
  /**
   * URL base da API (ex.: http://localhost:3000/api).
   * import.meta.env é específico do Vite — substitui process.env do Node.
   */
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",

  /**
   * useMock true  → services retornam dados de mocks/data.js (sem servidor).
   * useMock false → services chamam fetch via api/client.js.
   * Padrão é mock, a menos que VITE_USE_MOCK=false no .env.
   */
  useMock: import.meta.env.VITE_USE_MOCK !== "false",
};
