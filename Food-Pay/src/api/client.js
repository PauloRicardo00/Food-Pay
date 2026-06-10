/**
 * Cliente HTTP centralizado para comunicação com o backend.
 *
 * Responsabilidades:
 * - Montar a URL final a partir da base definida em .env
 * - Injetar o Bearer token JWT em rotas protegidas
 * - Normalizar erros de API em ApiError (com status HTTP)
 * - Expor atalhos tipados: api.get / post / put / patch / delete
 */
import { env } from "../config/env";

const TOKEN_KEY = "foodpay_token";

/** Extrai uma mensagem amigável de diferentes formatos de erro da API */
export function getApiErrorMessage(error, fallback = "Erro na requisição.") {
  const data = error?.body ?? error?.response?.data;

  if (typeof data === "string" && data.trim()) return data;

  if (data && typeof data === "object") {
    if (data.message) return data.message;
    if (data.mensagem) return data.mensagem;
    if (data.erro) return data.erro;
    if (data.error) return data.error;
    if (data.title) return data.title;
    if (Array.isArray(data.errors)) return data.errors.join(" ");

    if (data.errors && typeof data.errors === "object") {
      const mensagens = Object.values(data.errors).flat().filter(Boolean);
      if (mensagens.length > 0) return mensagens.join(" ");
    }
  }

  if (error?.message && error.message !== "Network Error") return error.message;

  return fallback;
}

/** Erro customizado que preserva o status HTTP — facilita tratar 401, 404 etc. na UI */
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

/** Persiste ou remove o token conforme o valor recebido */
export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Função base de requisição usada por todos os métodos do objeto api.
 *
 * @param {string} path  - Caminho relativo, ex.: /aluno/dashboard
 * @param {object} options - { method, body, headers, auth }
 *   auth: false desativa o envio do Bearer token (login, cadastro)
 */
export async function apiRequest(path, options = {}) {
  const { method = "GET", body, headers = {}, auth = true } = options;

  const requestHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers,
  };

  if (auth) {
    const token = getToken();
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
  }

  const url = `${env.apiUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else if (response.status !== 204) {
    // 204 No Content: resposta válida sem corpo (comum em DELETE)
    data = await response.text();
  }

  if (!response.ok) {
    const message = getApiErrorMessage(
      { body: data },
      `Erro na requisição (${response.status})`
    );
    throw new ApiError(message, response.status, data);
  }

  return data;
}

/** Atalhos para os métodos HTTP mais comuns */
export const api = {
  get:    (path, options)        => apiRequest(path, { ...options, method: "GET" }),
  post:   (path, body, options)  => apiRequest(path, { ...options, method: "POST",  body }),
  put:    (path, body, options)  => apiRequest(path, { ...options, method: "PUT",   body }),
  patch:  (path, body, options)  => apiRequest(path, { ...options, method: "PATCH", body }),
  delete: (path, options)        => apiRequest(path, { ...options, method: "DELETE" }),
};
