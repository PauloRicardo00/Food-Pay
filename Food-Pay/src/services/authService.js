/**
 * Service de autenticação: login, cadastro, sessão e recuperação de senha.
 *
 * Alterna entre modo mock (desenvolvimento sem backend) e API real
 * conforme env.useMock. No mock, um "banco" em localStorage simula
 * cadastros e validação de credenciais — senha errada retorna 401.
 */
import { ApiError, api, setToken } from "../api/client";
import { endpoints } from "../api/endpoints";
import { env } from "../config/env";
import { homePorPerfil } from "../config/navigation";

const USER_KEY    = "foodpay_user";
const USERS_DB_KEY = "foodpay_users";

function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  setToken(null);
  localStorage.removeItem(USER_KEY);
}

// ---------------------------------------------------------------------------
// Banco de dados mock (localStorage)
// ---------------------------------------------------------------------------

function readUsersDb() {
  try { return JSON.parse(localStorage.getItem(USERS_DB_KEY)) || []; }
  catch { return []; }
}

function writeUsersDb(users) {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

function findUser(email, perfil) {
  const e = (email || "").trim().toLowerCase();
  return readUsersDb().find((u) => u.email.toLowerCase() === e && u.perfil === perfil);
}

// ---------------------------------------------------------------------------
// Implementações mock
// ---------------------------------------------------------------------------

async function loginMock({ email, senha, perfil }) {
  await delay(400);
  const db = readUsersDb();

  /**
   * Se o banco mock ainda estiver vazio, aceita qualquer credencial
   * (modo demo). Assim que houver pelo menos um cadastro, passa a
   * exigir e-mail e senha válidos.
   */
  if (db.length > 0) {
    const found = findUser(email, perfil);
    if (!found || found.senha !== senha) {
      throw new ApiError("Usuário ou senha incorretos.", 401);
    }
    const user  = { id: found.id, nome: found.nome, email: found.email, perfil: found.perfil };
    const token = "mock-jwt-token";
    setToken(token);
    saveUser(user);
    return { token, user };
  }

  const user  = { id: "mock-1", nome: email?.split("@")[0] || "Usuário", email: email || "usuario@email.com", perfil: perfil || "aluno" };
  const token = "mock-jwt-token";
  setToken(token);
  saveUser(user);
  return { token, user };
}

async function registerMock(payload) {
  await delay(400);
  const db    = readUsersDb();
  const email = (payload.email || "").trim().toLowerCase();

  if (db.some((u) => u.email.toLowerCase() === email && u.perfil === payload.perfil)) {
    throw new ApiError("Já existe uma conta com esse e-mail para este perfil.", 409);
  }

  db.push({ id: `mock-${Date.now()}`, nome: payload.nome, email: payload.email, senha: payload.senha, perfil: payload.perfil });
  writeUsersDb(db);
  return { message: "Cadastro realizado com sucesso", email: payload.email };
}

// ---------------------------------------------------------------------------
// Implementações com API real
// ---------------------------------------------------------------------------

async function loginApi({ email, senha, perfil }) {
  try {
    const data = await api.post(endpoints.auth.login, { email, senha, perfil }, { auth: false });
    setToken(data.token);
    saveUser(data.user);
    return { token: data.token, user: data.user };
  } catch (err) {
    if (err instanceof ApiError && [400, 401, 404].includes(err.status)) {
      throw new ApiError("Usuário ou senha incorretos.", err.status);
    }
    throw err;
  }
}

async function registerApi({ nome, email, senha, perfil }) {
  if (perfil === "funcionario") {
    return api.post("/funcionarios", { nome, email, senhaHash: senha, cargo: "Atendente", ativo: true }, { auth: false });
  }
  if (perfil === "responsavel") {
    return api.post("/responsaveis", { nome, email, senhaHash: senha, telefone: "", ativo: true }, { auth: false });
  }
  return api.post("/alunos", { nome, email, senhaHash: senha, saldo: 0, limiteDiario: 20, ativo: true }, { auth: false });
}

// ---------------------------------------------------------------------------
// Exports públicos
// ---------------------------------------------------------------------------

export async function login(credentials) {
  return env.useMock ? loginMock(credentials) : loginApi(credentials);
}

export async function register(payload) {
  return env.useMock ? registerMock(payload) : registerApi(payload);
}

/** Solicita envio do código de verificação para redefinição de senha */
export async function solicitarResetSenha({ email, perfil }) {
  try {
    const data = await api.post(endpoints.auth.solicitarResetSenha, { email, perfil }, { auth: false });
    return { ok: true, mensagem: data?.mensagem || "Código enviado para o e-mail informado." };
  } catch (err) {
    if (err instanceof ApiError) throw new ApiError(err.message || "Não foi possível enviar o código.", err.status);
    throw err;
  }
}

/** Valida o código recebido por e-mail e persiste a nova senha */
export async function confirmarResetSenha({ email, perfil, codigo, novaSenha }) {
  try {
    const data = await api.post(endpoints.auth.confirmarResetSenha, { email, perfil, codigo, novaSenha }, { auth: false });
    return { ok: true, mensagem: data?.mensagem || "Senha alterada com sucesso." };
  } catch (err) {
    if (err instanceof ApiError) throw new ApiError(err.message || "Não foi possível alterar a senha.", err.status);
    throw err;
  }
}

/**
 * Valida a sessão ao abrir a aplicação.
 * Em modo real chama GET /auth/me; em mock retorna o usuário do localStorage.
 * Se a validação falhar, limpa a sessão e retorna null.
 */
export async function fetchCurrentUser() {
  const stored = getStoredUser();
  if (env.useMock) return stored;
  if (!stored) return null;
  try {
    const user = await api.get(endpoints.auth.me);
    saveUser(user);
    return user;
  } catch {
    clearSession();
    return null;
  }
}

export function logout() {
  clearSession();
  if (!env.useMock) {
    api.post(endpoints.auth.logout, {}).catch(() => {});
  }
}

export function getHomeRoute(perfil) {
  return homePorPerfil[perfil] || "/aluno";
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
