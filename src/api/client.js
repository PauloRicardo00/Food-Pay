/**
 * Cliente HTTP único para falar com o backend.
 * Centraliza URL, headers, token JWT e tratamento de erro.
 */
import { env } from "../config/env";

// Chave usada no localStorage para persistir o token entre recarregamentos
const TOKEN_KEY = "foodpay_token";

/** Erro customizado com status HTTP — facilita exibir mensagem na UI */
export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Função base de requisição — usada por api.get, api.post, etc.
 * @param {string} path caminho relativo (ex.: /aluno/dashboard)
 * @param {object} options method, body, headers, auth
 */
export async function apiRequest(path, options = {}) {
  const { method = "GET", body, headers = {}, auth = true } = options;

  const requestHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers,
  };

  // Rotas protegidas enviam Bearer token se o usuário estiver logado
  if (auth) {
    const token = getToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  // Monta URL final: base do .env + path (evita barra duplicada)
  const url = `${env.apiUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    // JSON.stringify converte objeto JS em string para o corpo da requisição
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else if (response.status !== 204) {
    // 204 = sucesso sem corpo (comum em DELETE)
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Erro na requisição (${response.status})`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}

/** Atalhos para não repetir method em cada chamada */
export const api = {
  get: (path, options) => apiRequest(path, { ...options, method: "GET" }),
  post: (path, body, options) => apiRequest(path, { ...options, method: "POST", body }),
  put: (path, body, options) => apiRequest(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) => apiRequest(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => apiRequest(path, { ...options, method: "DELETE" }),
};
